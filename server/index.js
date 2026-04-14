require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('node:fs');
const path = require('node:path');

const app = express();

// ========================================
// ERROR LOGGING SYSTEM
// ========================================
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function logError(type, message, details = '') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type}] ${message} ${details}\n`;
  const logFile = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logEntry);
}

// Capture unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  logError('UNHANDLED_REJECTION', String(reason), reason?.stack || '');
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  logError('UNCAUGHT_EXCEPTION', error.message, error.stack);
});

// ========================================
// SECURITY & PERFORMANCE MIDDLEWARE
// ========================================
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());

// CORS — restrict to known origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin requests (no origin header) and allowed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Global rate limiter — 100 requests per minute per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later' },
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request logging middleware (log failed requests)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      logError(
        'API_ERROR',
        `${req.method} ${req.originalUrl} ${res.statusCode}`,
        `Duration: ${duration}ms`
      );
    }
  });
  next();
});

// Database connection
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    // Initialize cron jobs after DB connection
    require('./utils/cron');
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/queries', require('./routes/queries'));
app.use('/api/responses', require('./routes/responses'));
app.use('/api/kb', require('./routes/kb'));
app.use('/api/moderator', require('./routes/moderator'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/quizzes', require('./routes/quizzes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================================
// SERVE STATIC CLIENT BUILD IN PRODUCTION
// ========================================
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuildPath));

  // All non-API routes serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  logError('SERVER_CRASH', `${req.method} ${req.originalUrl}: ${err.message}`, err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
