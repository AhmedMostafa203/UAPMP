const ClassAnnouncement = require("../models/ClassAnnouncement");
const Class = require("../models/Class");

// POST /api/class-announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, classId, scheduledAt, sendNow } = req.body;
    const instructorId = req.user._id;

    if (!title || !content || !classId) {
      return res
        .status(400)
        .json({ message: "title, content, and classId are required." });
    }

    // Verify class belongs to this instructor
    const cls = await Class.findOne({ _id: classId, instructor: instructorId });
    if (!cls) {
      return res
        .status(403)
        .json({ message: "Class not found or access denied." });
    }

    let status = "draft";
    let resolvedScheduledAt = null;

    if (sendNow) {
      status = "sent";
    } else if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        return res
          .status(400)
          .json({ message: "scheduledAt must be in the future." });
      }
      status = "scheduled";
      resolvedScheduledAt = scheduledDate;
    }

    const announcement = await ClassAnnouncement.create({
      title,
      content,
      classId,
      createdBy: instructorId,
      status,
      scheduledAt: resolvedScheduledAt,
      sentAt: sendNow ? new Date() : null,
      isAiGenerated: req.body.isAiGenerated || false,
    });

    res.status(201).json({ announcement });
  } catch (err) {
    console.error("[ClassAnnouncement] createAnnouncement error:", err.message);
    res.status(500).json({ message: "Failed to create announcement." });
  }
};

// GET /api/classannouncement?classId=...
const getAnnouncements = async (req, res) => {
  try {
    const { classId } = req.query;
    if (!classId)
      return res.status(400).json({ message: "classId is required." });

    const query = { classId, status: "sent" };

    // Instructors can also see scheduled/draft announcements for their own class
    if (req.user.role === "instructor") {
      const cls = await Class.findOne({
        _id: classId,
        instructor: req.user._id,
      });
      if (cls) delete query.status; // Show all statuses to the class instructor
    }

    const announcements = await ClassAnnouncement.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName");

    res.json({ announcements });
  } catch (err) {
    console.error("[ClassAnnouncement] getAnnouncements error:", err.message);
    res.status(500).json({ message: "Failed to fetch announcements." });
  }
};

module.exports = { createAnnouncement, getAnnouncements };
