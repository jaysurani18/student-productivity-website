const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'campuscompanion_secret_2025';

const { authenticate, adminOnly } = require('../middleware/auth');

// Register (Admin Only)
router.post('/register', authenticate, adminOnly, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });

        const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (exists.rows.length > 0) return res.status(409).json({ error: 'Email already registered' });

        const hash = await bcrypt.hash(password, 10);
        // Default to student, allow explicitly setting admin if needed
        const userRole = role === 'admin' ? 'admin' : 'student';

        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hash, userRole]
        );

        const user = result.rows[0];
        res.status(201).json({ user, message: 'User created successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error during user creation' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get current user (verify token)
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token' });
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Get all users (Admin Only)
router.get('/users', authenticate, adminOnly, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

// Update current user (Name and Password only)
router.put('/me', authenticate, async (req, res) => {
    try {
        const { name, password } = req.body;
        const userId = req.user.id;

        let query = 'UPDATE users SET name = $1';
        let values = [name];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password_hash = $2 WHERE id = $3 RETURNING id, name, email, role';
            values.push(hashedPassword, userId);
        } else {
            query += ' WHERE id = $2 RETURNING id, name, email, role';
            values.push(userId);
        }

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

module.exports = router;
