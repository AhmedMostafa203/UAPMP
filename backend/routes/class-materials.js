const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ClassMaterial = require('../models/ClassMaterial');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// تأكد من وجود مجلد uploads
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// رفع ملف
router.post('/', authenticateToken, authorizeRole('instructor'), upload.single('file'), async (req, res) => {
    try {
        const { classId } = req.body;
        if (!req.file) return res.status(400).json({ success: false, message: 'No file' });

        const material = new ClassMaterial({
            classId,
            fileName: req.file.originalname,
            fileUrl: '/uploads/' + req.file.filename,
            fileType: req.file.mimetype.startsWith('image/') ? 'image' : 'pdf',
            uploadedBy: req.user.id
        });
        await material.save();
        res.json({ success: true, material });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// جلب المواد
router.get('/class/:classId', authenticateToken, async (req, res) => {
    const materials = await ClassMaterial.find({ classId: req.params.classId });
    res.json({ success: true, materials });
});

module.exports = router;