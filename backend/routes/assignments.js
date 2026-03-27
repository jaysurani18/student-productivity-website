const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for assignment uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/assignments';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for assignments
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type! Allowed types: images, PDFs, Word docs, and archives.'));
    }
});

// Submit assignment
router.post('/', authenticate, upload.single('assignment_file'), async (req, res) => {
    try {
        const { subject, description, notice_id } = req.body;
        const userId = req.user.id;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Assignment file is required' });
        }

        const filePath = `/uploads/assignments/${req.file.filename}`;
        
        const result = await pool.query(
            'INSERT INTO assignment_submissions (user_id, subject, description, file_path, notice_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, subject, description || '', filePath, notice_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message || 'Server error submitting assignment' });
    }
});

// Get user's submitted assignments
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        // Optionally admins could see all, but for now we filter by user
        let query = 'SELECT * FROM assignment_submissions WHERE user_id = $1 ORDER BY submitted_at DESC';
        let values = [userId];

        // If admin, maybe let them see all? But the frontend doesn't need this yet.
        if (req.user.role === 'admin') {
             query = `
                SELECT a.*, u.name as student_name, u.email as student_email 
                FROM assignment_submissions a
                JOIN users u ON a.user_id = u.id
                ORDER BY a.submitted_at DESC
             `;
             values = [];
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching assignments' });
    }
});

module.exports = router;
