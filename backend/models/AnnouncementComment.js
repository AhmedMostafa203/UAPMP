const mongoose = require("mongoose");

const announcementCommentSchema = new mongoose.Schema(
  {
    announcementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassAnnouncement",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      default: "Unknown",
    },
    authorRole: {
      type: String,
      enum: ["student", "instructor"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    editedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "AnnouncementComment",
  announcementCommentSchema,
);
