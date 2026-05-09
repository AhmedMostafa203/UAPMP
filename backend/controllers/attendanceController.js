// controllers/attendanceController.js

const AttendanceSession = require("../models/AttendanceSession");
const { generateAttendanceExcel } = require("../utils/excelExport");
const { getDistanceMeters } = require("../utils/gps");

const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");

const User = require("../models/User");
const Class = require("../models/Class");

/* =========================================================
   CREATE SESSION
========================================================= */
exports.createSession = async (req, res) => {
  try {
    const { classId, duration, location } = req.body;

    const now = new Date();

    const activeSession = await AttendanceSession.findOne({
      classId,
      isActive: true,
      expiresAt: { $gt: now },
    });

    if (activeSession) {
      return res.status(400).json({
        message: "An active session already exists for this class.",
      });
    }

    const expiresAt = new Date(now.getTime() + (duration || 15) * 60000);

    const session = new AttendanceSession({
      classId,
      instructorId: req.user._id,
      startedAt: now,
      expiresAt,
      location: {
        lat: location?.lat,
        lng: location?.lng,
        radius: location?.radius || 50,
      },
      totalStudents: 0,
      isActive: true,
    });

    await session.save();

    const msUntilExpire = expiresAt.getTime() - now.getTime();

    setTimeout(async () => {
      try {
        const fresh = await AttendanceSession.findById(session._id);
        if (!fresh || !fresh.isActive) return;

        if (fresh.expiresAt <= new Date()) {
          fresh.isActive = false;
          await fresh.save();
          await handleSessionEnd(fresh._id, fresh.instructorId);
        }
      } catch (err) {
        console.error("[autoEndSession]", err.message);
      }
    }, msUntilExpire);

    return res.status(201).json({
      message: "Attendance session started.",
      session,
    });
  } catch (err) {
    console.error("[createSession]", err);
    res.status(500).json({ message: "Failed to create session." });
  }
};

/* =========================================================
   CHECK-IN
========================================================= */
exports.checkIn = async (req, res) => {
  try {
    const { sessionId, lat, lng, radius } = req.body;

    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    const now = new Date();

    if (!session.isActive || session.expiresAt < now) {
      return res.status(400).json({
        message: "Session is not active or has expired.",
      });
    }

    const distance = getDistanceMeters(
      session.location.lat,
      session.location.lng,
      lat,
      lng,
    );

    const allowedRadius =
      typeof radius === "number" ? radius : session.location.radius || 50;

    if (distance > allowedRadius) {
      return res.status(400).json({
        message: `You are outside allowed radius (${allowedRadius}m).`,
      });
    }

    const already = session.students?.some(
      (s) => String(s.studentId) === String(req.user._id),
    );

    if (already) {
      return res.status(400).json({
        message: "Already checked in.",
      });
    }

    session.students.push({
      studentId: req.user._id,
      studentName: req.user.fullName,
      timestamp: now,
    });

    session.totalStudents = session.students.length;

    await session.save();

    return res.status(201).json({
      message: "Check-in successful.",
    });
  } catch (err) {
    console.error("[checkIn]", err);
    res.status(500).json({ message: "Failed to check in." });
  }
};

/* =========================================================
   END SESSION
========================================================= */
exports.endSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found.",
      });
    }

    if (!session.isActive) {
      return res.status(400).json({
        message: "Session already ended.",
      });
    }

    session.isActive = false;
    await session.save();

    handleSessionEnd(session._id, session.instructorId);

    return res.status(200).json({
      message: "Session ended successfully.",
    });
  } catch (err) {
    console.error("[endSession]", err);
    res.status(500).json({
      message: "Failed to end session.",
    });
  }
};

/* =========================================================
   GET ACTIVE SESSION (FIXED)
========================================================= */
exports.getActiveSession = async (req, res) => {
  try {
    const { classId } = req.params;

    const now = new Date();

    const session = await AttendanceSession.findOne({
      classId,
      isActive: true,
      expiresAt: { $gt: now },
    });

    return res.status(200).json({
      active: !!session,
      session: session || null,
    });
  } catch (err) {
    console.error("[getActiveSession]", err);
    res.status(500).json({
      message: "Failed to get active session.",
    });
  }
};

/* =========================================================
   HANDLE SESSION END (SAFE EMAIL)
========================================================= */
async function handleSessionEnd(sessionId, instructorId) {
  try {
    const session = await AttendanceSession.findById(sessionId);
    if (!session) return;

    let className = "Class";

    if (session.classId) {
      const cls = await Class.findById(session.classId.toString());
      if (cls?.name) {
        className = cls.name.replace(/[^a-zA-Z0-9-_ ]/g, "");
      }
    }

    // Get all enrolled students in the class
    let enrolledStudents = [];
    if (session.classId) {
      const cls = await Class.findById(session.classId.toString()).populate(
        "students",
      );
      if (cls && Array.isArray(cls.students)) {
        enrolledStudents = cls.students;
      }
    }

    // Map of checked-in studentId to timestamp
    const checkedInMap = new Map();
    for (const s of session.students || []) {
      checkedInMap.set(String(s.studentId), s.timestamp);
    }

    // Prepare export data for all enrolled students
    const exportData = [];
    for (const student of enrolledStudents) {
      const checkedIn = checkedInMap.has(String(student._id));
      exportData.push({
        studentName: student.fullName,
        studentId: student.studentId || student._id,
        attendance: checkedIn ? "PRESENT" : "ABSENT",
        timestamp: checkedIn ? checkedInMap.get(String(student._id)) : "",
      });
    }

    const buffer = await generateAttendanceExcel(exportData);

    const exportDir = path.join(__dirname, "../exports");
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    const filePath = path.join(exportDir, `${className}.xlsx`);
    fs.writeFileSync(filePath, buffer);

    // 🔥 IMPORTANT: await email
    await sendEmail(buffer, className, instructorId);
  } catch (err) {
    console.error("[handleSessionEnd ERROR]", err);
  }
}

/* =========================================================
   EMAIL SERVICE (SAFE)
========================================================= */
async function sendEmail(buffer, fileBaseName, instructorId) {
  try {
    const instructor = await User.findById(instructorId);
    if (!instructor?.email) {
      console.warn("[EMAIL] Instructor email missing");
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: "UAPMP <onboarding@resend.dev>",
      to: "ahmedloby8@gmail.com", //  developer email for testing
      subject: "Attendance Export",
      text: "Attached is your attendance sheet.",
      attachments: [
        {
          filename: `${fileBaseName}.xlsx`,
          content: buffer.toString("base64"),
        },
      ],
    });

    if (result?.error) {
      console.error("[EMAIL FAILED]", result.error);
      return;
    }

    console.log("[EMAIL SUCCESS]", result?.data?.id);
  } catch (err) {
    console.error("[EMAIL EXCEPTION]", err.message);
  }
}
