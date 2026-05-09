// models/AttendanceSession.js

const mongoose = require("mongoose");

const AttendanceSessionSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      radius: {
        type: Number,
        default: 50,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    totalStudents: {
      type: Number,
      default: 0,
    },

    students: {
      type: [
        {
          studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          studentName: {
            type: String,
            required: true,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

AttendanceSessionSchema.index({ classId: 1, isActive: 1 });

module.exports = mongoose.model("AttendanceSession", AttendanceSessionSchema);
