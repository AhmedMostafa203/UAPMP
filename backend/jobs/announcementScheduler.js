const cron = require("node-cron");
const ClassAnnouncement = require("../models/ClassAnnouncement");

/**
 * Runs every minute.
 * Finds all announcements with status='scheduled' and scheduledAt <= now,
 * then marks them as 'sent'.
 *
 * In production you would extend this to:
 * - Send push notifications to enrolled students
 * - Send emails via nodemailer (already installed)
 * - Emit socket.io events for real-time delivery
 */
const startAnnouncementScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const result = await ClassAnnouncement.updateMany(
        {
          status: "scheduled",
          scheduledAt: { $lte: now },
        },
        {
          $set: {
            status: "sent",
            sentAt: now,
          },
        },
      );

      if (result.modifiedCount > 0) {
        console.log(
          `[Scheduler] ${result.modifiedCount} scheduled announcement(s) sent at ${now.toISOString()}`,
        );
      }
    } catch (err) {
      console.error(
        "[Scheduler] Error processing scheduled announcements:",
        err.message,
      );
    }
  });

  console.log(
    "[Scheduler] Announcement scheduler started (runs every minute).",
  );
};

module.exports = { startAnnouncementScheduler };
