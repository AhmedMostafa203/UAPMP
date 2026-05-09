const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const User = require("../models/User");

// GET - Mobile profile (نسخة خفيفة للموبايل)
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("fullName email role university college studentId isEmailVerified");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST - تسجيل جهاز الموبايل للإشعارات
router.post("/register-device", authenticateToken, async (req, res) => {
    try {
        const { deviceToken, platform } = req.body;

        await User.findByIdAndUpdate(req.user.id, {
            $set: {
                lastDeviceToken: deviceToken,
                lastPlatform: platform,
                lastActive: new Date()
            }
        });

        res.json({ message: "Device registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to register device" });
    }
});

module.exports = router;