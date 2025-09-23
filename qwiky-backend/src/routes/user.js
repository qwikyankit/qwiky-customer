const express = require('express');
const { body, param, validationResult } = require('express-validator');
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

// GET /test - Test endpoint for user routes
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User API working 🚀',
    timestamp: new Date().toISOString(),
    service: 'user-service'
  });
});

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
      .select('id, mobile, name, email, created_at')
      .eq('mobile', mobile)
      .single();

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'User already exists',
        user: existingUser,
        isExisting: true
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
      },
      isExisting: false
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

// GET /api/user/:id
router.get('/:id', [
  param('id').isUUID().withMessage('Valid User ID is required')
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, mobile, name, email, created_at, updated_at')
      .eq('id', id)
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

// PUT /api/user/:id
router.put('/:id', [
  param('id').isUUID().withMessage('Valid User ID is required'),
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required')
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    updateData.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }

    logger.info('User updated successfully:', { userId: id });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });

  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;