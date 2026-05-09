const mongoose = require("mongoose");

const classAnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibleTo: {
      type: [String],
      enum: ["student", "instructor"],
      default: ["student", "instructor"],
    },
    attachments: [
      { fileUrl: String, originalName: String, mimetype: String, size: Number },
    ],
    links: [{ label: String, url: String }],
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent"],
      default: "sent",
    },
    scheduledAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    isAiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true },
);

classAnnouncementSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model("ClassAnnouncement", classAnnouncementSchema);
