const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/notices';
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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images, PDFs, and Word docs are allowed!'));
    }
});

// Get all notices
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notices ORDER BY posted_date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching notices' });
    }
});

// Create notice (Admin Only) - Now with file upload support
router.post('/', authenticate, adminOnly, upload.single('attachment'), async (req, res) => {
    try {
        const { title, content, severity, requires_submission, deadline, due_date } = req.body;
        const attachmentPath = req.file ? `/uploads/notices/${req.file.filename}` : null;
        
        const result = await pool.query(
            'INSERT INTO notices (title, content, severity, attachment_path, requires_submission, deadline, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, content, severity || 'info', attachmentPath, requires_submission === 'true' || requires_submission === true, deadline || null, due_date || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message || 'Server error creating notice' });
    }
});

// Delete notice (Admin Only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find notice first to delete the file if exists
        const notice = await pool.query('SELECT attachment_path FROM notices WHERE id = $1', [id]);
        if (notice.rows.length > 0 && notice.rows[0].attachment_path) {
            const filePath = path.join(__dirname, '..', notice.rows[0].attachment_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        const result = await pool.query('DELETE FROM notices WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Notice not found' });
        res.json({ message: 'Notice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting notice' });
    }
});

module.exports = router;
