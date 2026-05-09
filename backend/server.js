const path = require("path");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

/**
 * UAPMP Backend Server
 * Main entry point for the application
 */

require("dotenv").config({ path: __dirname + "/../config/.env" });
console.log(
  "API KEY LOADED:",
  process.env.GEMINI_API_KEY ? "YES" : "NO - KEY IS MISSING",
);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const announcementRoutes = require("./routes/announcement");
const classAnnouncementRoutes = require("./routes/classannouncement");
const classesRoutes = require("./routes/classes");
const attendanceRoutes = require("./routes/attendance");
const adminRoutes = require("./routes/admin");
const aiRoutes = require("./modules/ai/ai.routes");

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5501",
      "http://localhost:5501",
      "https://university-academic-productivity-mana-ahmedmostafa203s-projects.vercel.app",
      "null",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers for cross-origin OAuth and postMessage support
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// Static uploads folder (for announcement attachments)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Body:", req.body);
    if (req.files) console.log("Files:", req.files);
  }
  next();
});

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, "../frontend/html")));

// Route to serve index.html as the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/html/index.html"));
});

// ============================================
// API ROUTES
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/classannouncements", classAnnouncementRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR]", err);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("[INFO] Database connection established successfully");

    // Start scheduler AFTER DB is ready so Mongoose models are available
    const {
      startAnnouncementScheduler,
    } = require("./jobs/announcementScheduler");
    startAnnouncementScheduler();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`[SUCCESS] Server initialized on port ${PORT}`);
      console.log("[INFO] Application is ready to accept requests");
    });
  })
  .catch((err) => {
    console.error("[ERROR] Database connection failed:", err.message);
    process.exit(1);
  });
