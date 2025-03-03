/**
 * Main server file for Quizzy-Gen API
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/v1/chapters', require('./routes/chapters'));
app.use('/api/v1/questions', require('./routes/questions'));
app.use('/api/v1/quizzes', require('./routes/quizzes'));
app.use('/api/v1/quiz-attempts', require('./routes/quizAttempts'));
app.use('/api/v1/admin', require('./routes/admin'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Root route - Public API information
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Quizzy-Gen API',
    version: '1.0.0',
    documentation: '/api-docs',
    publicEndpoints: [
      '/',
      '/health',
      '/api/v1/admin/login'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `Route ${req.originalUrl} not found`
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Server error',
      details: err.message
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 