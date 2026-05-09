const { generateAnnouncementPreview } = require("./ai.service");

const previewAnnouncement = async (req, res) => {
  try {
    const { prompt, language, courseName, instructorName } = req.body;

    if (!prompt || !language || !courseName || !instructorName) {
      return res.status(400).json({
        message:
          "prompt, language, courseName, and instructorName are all required.",
      });
    }

    const result = await generateAnnouncementPreview({
      prompt,
      language,
      courseName,
      instructorName,
    });

    // result = { title, message }
    res.json(result);
  } catch (err) {
    console.error("[AI Controller] previewAnnouncement error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to generate announcement preview." });
  }
};

module.exports = { previewAnnouncement };
