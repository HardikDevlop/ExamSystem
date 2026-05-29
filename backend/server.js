/**
 * Online Examination System - Backend Server
 * Node.js + Express + MongoDB
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const codingRoutes = require('./routes/codingRoutes');

connectDB();

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : [];

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/coding', codingRoutes);

// API root & health check
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Online Exam API root',
    endpoints: ['/api/health', '/api/auth', '/api/admin', '/api/user', '/api/coding'],
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Online Exam API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

