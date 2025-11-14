const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const http = require('http');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();

// Health check endpoint to prevent Render from sleeping
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Backend is running properly'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dispatch', dispatchRoutes);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Log the health check endpoint for easy access
  console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});

// Keep alive function to prevent Render from sleeping
const keepAlive = () => {
  // Create options for the HTTP request
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/health',
    method: 'GET'
  };

  // Make the HTTP request
  const req = http.request(options, (res) => {
    console.log(`Keep alive response status: ${res.statusCode}`);
  });

  req.on('error', (e) => {
    console.log(`Keep alive request error: ${e.message}`);
  });

  req.end();
  console.log('Keep alive ping sent at:', new Date().toISOString());
};

// Send a ping every 14 minutes (Render sleeps after 15 minutes of inactivity)
setInterval(keepAlive, 840000); // Every 14 minutes