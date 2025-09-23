const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Default error response
  let error = {
    success: false,
    message: 'Internal server error'
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation failed';
    error.details = err.details;
    return res.status(400).json(error);
  }

  if (err.name === 'UnauthorizedError') {
    error.message = 'Unauthorized access';
    return res.status(401).json(error);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File size too large';
    return res.status(413).json(error);
  }

  // Include error details in development
  if (process.env.NODE_ENV === 'development') {
    error.error = err.message;
    error.stack = err.stack;
  }

  res.status(500).json(error);
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};

module.exports = { errorHandler, notFound };