const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');

// Get all events (All authenticated users can view the schedule)
router.get('/', authenticate, async (req, res) => {
    try {
        const { date } = req.query;
        let query = 'SELECT * FROM events';
        let values = [];

        if (date) {
            values.push(date + '%'); // VERY simple date filtering via LIKE, ideally use date casting
            query += " WHERE start_time::text LIKE $1";
        }
        query += ' ORDER BY start_time ASC';

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching events' });
    }
});

// Create event (Admin Only)
router.post('/', authenticate, adminOnly, async (req, res) => {
    try {
        const { title, start_time, end_time, location, event_type } = req.body;
        const result = await pool.query(
            'INSERT INTO events (title, start_time, end_time, location, event_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, start_time, end_time, location, event_type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error creating event' });
    }
});

// Update event (Admin Only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, start_time, end_time, location, event_type } = req.body;
        const result = await pool.query(
            `UPDATE events
             SET title = $1, start_time = $2, end_time = $3, location = $4, event_type = $5
             WHERE id = $6 RETURNING *`,
            [title, start_time, end_time, location, event_type, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error updating event' });
    }
});

// Delete event (Admin Only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting event' });
    }
});

module.exports = router;
