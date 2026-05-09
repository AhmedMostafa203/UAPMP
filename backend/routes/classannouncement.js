/**
 * Class Announcement Routes
 * Instructors can create, update, delete class-specific announcements.
 * Students can view announcements.
 * Both students and instructors can post, edit, and delete their own comments.
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const ClassAnnouncement = require("../models/ClassAnnouncement");
const AnnouncementComment = require("../models/AnnouncementComment");
const { authenticateToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

/* ─────────────────────────────────────────────────────────────────────────────
   SCHEDULER — auto-publish scheduled announcements every 60 seconds
   Call startAnnouncementScheduler() once from your server entry file,
   e.g.  require('./routes/classAnnouncementRoutes').startAnnouncementScheduler()
   ───────────────────────────────────────────────────────────────────────────── */
let _schedulerStarted = false;
function startAnnouncementScheduler() {
  if (_schedulerStarted) return;
  _schedulerStarted = true;
  setInterval(async () => {
    try {
      const result = await ClassAnnouncement.updateMany(
        { status: "scheduled", scheduledAt: { $lte: new Date() } },
        { $set: { status: "sent", sentAt: new Date() } },
      );
      if (result.modifiedCount > 0) {
        console.log(
          `[Scheduler] Published ${result.modifiedCount} scheduled announcement(s)`,
        );
      }
    } catch (err) {
      console.error(
        "[Scheduler] Error publishing scheduled announcements:",
        err.message,
      );
    }
  }, 60_000);
  console.log("[Scheduler] Announcement scheduler started.");
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────────────────── */
function decodeOriginalName(raw) {
  if (!raw) return "attachment";
  try {
    return Buffer.from(raw, "latin1").toString("utf8");
  } catch {
    return raw;
  }
}

function deleteUploadedFile(fileUrl) {
  try {
    if (!fileUrl || typeof fileUrl !== "string") return;
    const rel = fileUrl.replace(/^\/uploads\//, "");
    const abs = path.join(__dirname, "../uploads", rel);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (err) {
    console.error("[Attachment] Failed to delete file:", err.message);
  }
}

function parseLinks(raw) {
  let arr = raw;
  if (typeof arr === "string") {
    try {
      arr = JSON.parse(arr);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => {
      if (typeof item === "string") return { label: item, url: item };
      if (item && typeof item === "object" && item.url) return item;
      return null;
    })
    .filter(Boolean);
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/classannouncements?classId=…
   ───────────────────────────────────────────────────────────────────────────── */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    const { classId } = req.query;
    if (!classId)
      return res
        .status(400)
        .json({ success: false, message: "classId is required" });

    const now = new Date();
    let query;

    if (role === "instructor") {
      // Instructors see: all their own announcements (any status)
      //                + sent announcements from others
      query = {
        classId,
        visibleTo: { $in: [role] }, // FIX: array-aware match
        $or: [
          { createdBy: req.user._id },
          { status: "sent" },
          { status: { $exists: false } },
          { status: null },
        ],
      };
    } else {
      // Students see: sent announcements
      //             + scheduled announcements whose time has already passed
      //             + legacy docs that have no status field
      query = {
        classId,
        visibleTo: { $in: [role] }, // FIX: array-aware match
        $or: [
          { status: "sent" },
          { status: "scheduled", scheduledAt: { $lte: now } },
          { status: { $exists: false } },
          { status: null },
        ],
      };
    }

    const announcements = await ClassAnnouncement.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log(
      "DEBUG STATUSES:",
      announcements.map((a) => ({
        title: a.title,
        status: a.status,
        scheduledAt: a.scheduledAt,
      })),
    );

    // Attach comment counts
    const ids = announcements.map((a) => a._id);
    const counts = await AnnouncementComment.aggregate([
      { $match: { announcementId: { $in: ids } } },
      { $group: { _id: "$announcementId", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => {
      countMap[String(c._id)] = c.count;
    });
    announcements.forEach((a) => {
      a.commentCount = countMap[String(a._id)] || 0;
    });

    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch class announcements",
    });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/classannouncements — instructor only
   ───────────────────────────────────────────────────────────────────────────── */
router.post(
  "/",
  authenticateToken,
  upload.array("files", 10),
  async (req, res) => {
    console.log("DEBUG POST:", {
      sendNow: req.body.sendNow,
      scheduledAt: req.body.scheduledAt,
      isAiGenerated: req.body.isAiGenerated,
    });

    if (req.user.role !== "instructor")
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only instructors can create announcements",
      });

    let {
      title,
      message,
      visibleTo,
      links,
      classId,
      scheduledAt,
      sendNow,
      isAiGenerated,
    } = req.body || {};

    console.log("DEBUG FIELDS:", {
      title,
      message,
      classId,
      sendNow,
      scheduledAt,
      wantsSchedule: sendNow === "false" || sendNow === false,
    });

    if (!title || !message || !classId)
      return res.status(400).json({
        success: false,
        message: "Title, message, and classId required",
      });

    let attachments = (req.files || []).map((f) => ({
      fileUrl: "/uploads/" + f.filename,
      originalName: decodeOriginalName(f.originalname),
      mimetype: f.mimetype,
      size: f.size,
    }));

    const parsedLinks = parseLinks(links);

    let visibleToArr = ["student", "instructor"];
    if (visibleTo && Array.isArray(visibleTo)) visibleToArr = visibleTo;
    else if (typeof visibleTo === "string") {
      try {
        const p = JSON.parse(visibleTo);
        if (Array.isArray(p)) visibleToArr = p;
      } catch {}
    }

    const wantsSchedule = sendNow === "false" || sendNow === false;
    let status = "sent";
    let resolvedScheduledAt = null;
    let sentAt = new Date();

    if (wantsSchedule && scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "scheduledAt must be in the future.",
        });
      }
      status = "scheduled";
      resolvedScheduledAt = scheduledDate;
      sentAt = null;
    }

    try {
      const announcement = await ClassAnnouncement.create({
        title,
        message,
        links: parsedLinks,
        attachments,
        createdBy: req.user._id,
        visibleTo: visibleToArr,
        classId,
        status,
        scheduledAt: resolvedScheduledAt,
        sentAt,
        isAiGenerated: isAiGenerated === "true" || isAiGenerated === true,
      });
      res.status(201).json({ success: true, announcement });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to create class announcement",
      });
    }
  },
);

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/classannouncements/:id — instructor (creator) only
   ───────────────────────────────────────────────────────────────────────────── */
router.delete("/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "instructor")
    return res.status(403).json({ success: false, message: "Forbidden" });
  try {
    const announcement = await ClassAnnouncement.findById(req.params.id);
    if (!announcement)
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    if (String(announcement.createdBy) !== String(req.user._id))
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the creator can delete",
      });
    (announcement.attachments || []).forEach((a) => {
      if (a.fileUrl) deleteUploadedFile(a.fileUrl);
    });
    await ClassAnnouncement.findByIdAndDelete(req.params.id);
    await AnnouncementComment.deleteMany({ announcementId: req.params.id });
    res.json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete class announcement",
    });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/classannouncements/:id — instructor (creator) only
   ───────────────────────────────────────────────────────────────────────────── */
router.put(
  "/:id",
  authenticateToken,
  upload.array("files", 10),
  async (req, res) => {
    if (req.user.role !== "instructor")
      return res.status(403).json({ success: false, message: "Forbidden" });

    let { title, message, visibleTo, links, removeAttachments } = req.body;
    if (!title || !message)
      return res
        .status(400)
        .json({ success: false, message: "Title and message required" });

    const parsedLinks = parseLinks(links);

    let visibleToArr = ["student", "instructor"];
    if (visibleTo && Array.isArray(visibleTo)) visibleToArr = visibleTo;
    else if (typeof visibleTo === "string") {
      try {
        const p = JSON.parse(visibleTo);
        if (Array.isArray(p)) visibleToArr = p;
      } catch {}
    }

    let removeIds = [];
    if (typeof removeAttachments === "string") {
      try {
        removeIds = JSON.parse(removeAttachments);
      } catch {}
    } else if (Array.isArray(removeAttachments)) removeIds = removeAttachments;

    try {
      const announcement = await ClassAnnouncement.findById(req.params.id);
      if (!announcement)
        return res
          .status(404)
          .json({ success: false, message: "Announcement not found" });
      if (String(announcement.createdBy) !== String(req.user._id))
        return res.status(403).json({
          success: false,
          message: "Forbidden: Only the creator can update",
        });

      if (removeIds.length) {
        const kept = [];
        for (const att of announcement.attachments) {
          const key = String(att._id || att.fileUrl || "");
          if (
            removeIds.some(
              (id) => String(id) === key || String(id) === att.fileUrl,
            )
          ) {
            if (att.fileUrl) deleteUploadedFile(att.fileUrl);
          } else {
            kept.push(att);
          }
        }
        announcement.attachments = kept;
      }

      if (req.files && req.files.length) {
        announcement.attachments.push(
          ...req.files.map((f) => ({
            fileUrl: "/uploads/" + f.filename,
            originalName: decodeOriginalName(f.originalname),
            mimetype: f.mimetype,
            size: f.size,
          })),
        );
      }

      announcement.title = title;
      announcement.message = message;
      announcement.links = parsedLinks;
      announcement.visibleTo = visibleToArr;
      await announcement.save();
      res.json({ success: true, announcement });
    } catch (err) {
      console.error("[PUT announcement]", err);
      res.status(500).json({
        success: false,
        message: "Failed to update class announcement",
      });
    }
  },
);

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/classannouncements/:announcementId/comments
   ───────────────────────────────────────────────────────────────────────────── */
router.get("/:announcementId/comments", authenticateToken, async (req, res) => {
  try {
    const announcement = await ClassAnnouncement.findById(
      req.params.announcementId,
    ).lean();
    if (!announcement)
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    if (!announcement.visibleTo.includes(req.user.role))
      return res.status(403).json({ success: false, message: "Access denied" });
    const comments = await AnnouncementComment.find({
      announcementId: req.params.announcementId,
    })
      .sort({ createdAt: 1 })
      .lean();
    res.json({ success: true, comments });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch comments" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/classannouncements/:announcementId/comments
   ───────────────────────────────────────────────────────────────────────────── */
router.post(
  "/:announcementId/comments",
  authenticateToken,
  async (req, res) => {
    try {
      const content = (req.body.content || "").trim();
      if (!content)
        return res
          .status(400)
          .json({ success: false, message: "Comment content is required" });
      if (content.length > 2000)
        return res.status(400).json({
          success: false,
          message: "Comment must be 2000 characters or fewer",
        });
      const announcement = await ClassAnnouncement.findById(
        req.params.announcementId,
      ).lean();
      if (!announcement)
        return res
          .status(404)
          .json({ success: false, message: "Announcement not found" });
      if (!announcement.visibleTo.includes(req.user.role))
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      const comment = await AnnouncementComment.create({
        announcementId: req.params.announcementId,
        classId: announcement.classId,
        author: req.user._id,
        authorName: req.user.fullName || req.user.name || "Unknown",
        authorRole: req.user.role,
        content,
      });
      res.status(201).json({ success: true, comment });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Failed to post comment" });
    }
  },
);

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/classannouncements/:announcementId/comments/:commentId
   ───────────────────────────────────────────────────────────────────────────── */
router.put(
  "/:announcementId/comments/:commentId",
  authenticateToken,
  async (req, res) => {
    try {
      const content = (req.body.content || "").trim();
      if (!content)
        return res
          .status(400)
          .json({ success: false, message: "Comment content is required" });
      if (content.length > 2000)
        return res.status(400).json({
          success: false,
          message: "Comment must be 2000 characters or fewer",
        });
      const comment = await AnnouncementComment.findById(req.params.commentId);
      if (!comment)
        return res
          .status(404)
          .json({ success: false, message: "Comment not found" });
      if (String(comment.author) !== String(req.user._id))
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only edit your own comments",
        });
      comment.content = content;
      comment.editedAt = new Date();
      await comment.save();
      res.json({ success: true, comment });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Failed to update comment" });
    }
  },
);

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/classannouncements/:announcementId/comments/:commentId
   ───────────────────────────────────────────────────────────────────────────── */
router.delete(
  "/:announcementId/comments/:commentId",
  authenticateToken,
  async (req, res) => {
    try {
      const comment = await AnnouncementComment.findById(req.params.commentId);
      if (!comment)
        return res
          .status(404)
          .json({ success: false, message: "Comment not found" });
      const isOwner = String(comment.author) === String(req.user._id);
      let canDelete = isOwner;
      if (!canDelete && req.user.role === "instructor") {
        const ann = await ClassAnnouncement.findById(
          req.params.announcementId,
        ).lean();
        if (ann && String(ann.createdBy) === String(req.user._id))
          canDelete = true;
      }
      if (!canDelete)
        return res.status(403).json({
          success: false,
          message: "Forbidden: You cannot delete this comment",
        });
      await AnnouncementComment.findByIdAndDelete(req.params.commentId);
      res.json({ success: true, message: "Comment deleted" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete comment" });
    }
  },
);

module.exports = router;
module.exports.startAnnouncementScheduler = startAnnouncementScheduler;
