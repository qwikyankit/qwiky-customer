const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// POST /api/user/signup
router.post('/signup', [
  body('mobile').isMobilePhone('en-IN').withMessage('Valid Indian mobile number is required'),
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required')
], validateRequest, async (req, res) => {
  try {
    const { mobile, name, email } = req.body;

    logger.info('Creating new user:', { mobile, name, email });

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, mobile')
      .eq('mobile', mobile)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this mobile number already exists',
        user: existingUser
      });
    }

    // Create new user
    const userData = {
      id: uuidv4(),
      mobile: mobile,
      name: name || '',
      email: email || ''
    };

    const { data: user, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    logger.info('User created successfully:', { userId: user.id, mobile: user.mobile });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    logger.error('User signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/user/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, mobile, name, email, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user
    });

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;