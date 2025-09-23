const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { logger } = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { validateEnv } = require('./utils/validation');

// Import routes
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const serviceRoutes = require('./routes/service');
const addressRoutes = require('./routes/address');
const slotRoutes = require('./routes/slot');

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

app.use(cors(corsOptions));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    service: 'qwiky-backend'
  });
});

// API routes
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/slots', slotRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Qwiky Backend running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`💳 Cashfree Environment: ${process.env.CASHFREE_ENV}`);
  logger.info(`🌐 CORS Origins: ${process.env.ALLOWED_ORIGINS}`);
});

module.exports = app;