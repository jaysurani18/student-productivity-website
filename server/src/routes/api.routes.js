import express from 'express';

const router = express.Router();

// Placeholder routes
router.get('/users', (req, res) => res.json({ message: 'Users endpoints' }));
router.get('/tasks', (req, res) => res.json({ message: 'Tasks endpoints' }));
router.get('/events', (req, res) => res.json({ message: 'Events endpoints' }));
router.get('/notices', (req, res) => res.json({ message: 'Notices endpoints' }));

export default router;
