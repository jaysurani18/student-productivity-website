const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

// Apply authentication to all task routes
router.use(authenticate);

// Get all tasks for the logged-in user
router.get('/', async (req, res) => {
    try {
        const { category, urgency, status } = req.query;
        const userId = req.user.id;
        let query = 'SELECT * FROM tasks WHERE user_id = $1';
        let values = [userId];

        if (category) {
            values.push(category);
            query += ` AND category = $${values.length}`;
        }
        if (urgency) {
            values.push(urgency);
            query += ` AND urgency_level = $${values.length}`;
        }
        if (status) {
            values.push(status === 'completed');
            query += ` AND is_completed = $${values.length}`;
        }
        
        query += ' ORDER BY due_date ASC, created_at DESC';

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching tasks' });
    }
});

// Get task statistics for the logged-in user
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE is_completed = true) as completed,
                COUNT(*) FILTER (WHERE is_completed = false) as pending,
                COUNT(*) FILTER (WHERE urgency_level = 'high' AND is_completed = false) as high_priority
            FROM tasks
            WHERE user_id = $1
        `, [userId]);
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching task stats' });
    }
});

// Get single task (must belong to user)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create task for the logged-in user
router.post('/', async (req, res) => {
    try {
        const { title, description, category, due_date, urgency_level } = req.body;
        const userId = req.user.id;
        const result = await pool.query(
            'INSERT INTO tasks (title, description, category, due_date, urgency_level, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, category, due_date, urgency_level || 'medium', userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error creating task' });
    }
});

// Toggle completion (must belong to user)
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_completed } = req.body;
        const userId = req.user.id;
        const result = await pool.query(
            'UPDATE tasks SET is_completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [is_completed, id, userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error toggling task' });
    }
});

// Update task
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, due_date, urgency_level, is_completed } = req.body;
        const userId = req.user.id;
        
        const result = await pool.query(
            `UPDATE tasks 
             SET title = $1, description = $2, category = $3, due_date = $4, urgency_level = $5, is_completed = $6 
             WHERE id = $7 AND user_id = $8 RETURNING *`,
            [title, description, category, due_date, urgency_level, is_completed, id, userId]
        );
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error updating task' });
    }
});

// Delete task
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting task' });
    }
});

module.exports = router;
