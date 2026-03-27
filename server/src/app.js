import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Campus Companion API' });
});

// Import basic routes
app.use('/api', apiRoutes);

export default app;
