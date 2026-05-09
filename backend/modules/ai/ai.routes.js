const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../../middleware/auth");
const { previewAnnouncement } = require("./ai.controller");

// POST /api/ai/preview-announcement
// Only instructors can generate AI announcement previews
router.post(
  "/preview-announcement",
  authenticateToken,
  authorizeRole("instructor"), // string, not array — matches your auth.js implementation
  previewAnnouncement,
);

module.exports = router;
