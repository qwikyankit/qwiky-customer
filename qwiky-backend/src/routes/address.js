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

// GET /test - Test endpoint for address routes
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Address API working 🚀',
    timestamp: new Date().toISOString(),
    service: 'address-service'
  });
});

// POST / - Add new address for a user
router.post('/', [
  body('userId').isUUID().withMessage('Valid User ID is required'),
  body('addressLine1').notEmpty().withMessage('Address line 1 is required'),
  body('addressLine2').optional().isString(),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('postalCode').notEmpty().withMessage('Postal code is required'),
  body('country').optional().isString(),
  body('latitude').optional().isFloat(),
  body('longitude').optional().isFloat(),
  body('googlePlaceId').optional().isString(),
  body('isDefault').optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const {
      userId,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      googlePlaceId,
      isDefault
    } = req.body;

    logger.info('Creating new address:', { userId, city, state });

    // 1. Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 2. If this is set as default, unset other default addresses
    if (isDefault) {
      await supabase
        .from('guest_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    // 3. Create address
    const addressData = {
      id: uuidv4(),
      user_id: userId,
      address_line_1: addressLine1,
      address_line_2: addressLine2 || '',
      city: city,
      state: state,
      postal_code: postalCode,
      country: country || 'India',
      latitude: latitude || null,
      longitude: longitude || null,
      google_place_id: googlePlaceId || null,
      is_default: isDefault || false
    };

    const { data: address, error: addressError } = await supabase
      .from('guest_addresses')
      .insert([addressData])
      .select()
      .single();

    if (addressError) {
      logger.error('Failed to create address:', addressError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create address'
      });
    }

    logger.info('Address created successfully:', { addressId: address.id });

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      address: {
        id: address.id,
        userId: address.user_id,
        addressLine1: address.address_line_1,
        addressLine2: address.address_line_2,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country,
        latitude: address.latitude,
        longitude: address.longitude,
        googlePlaceId: address.google_place_id,
        isDefault: address.is_default,
        createdAt: address.created_at
      }
    });

  } catch (error) {
    logger.error('Create address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /:userId - Get all addresses for a user
router.get('/:userId', [
  param('userId').isUUID().withMessage('Valid User ID is required')
], validateRequest, async (req, res) => {
  try {
    const { userId } = req.params;

    logger.info('Fetching addresses for user:', { userId });

    const { data: addresses, error } = await supabase
      .from('guest_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch addresses:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch addresses'
      });
    }

    // Transform the data for frontend consumption
    const transformedAddresses = addresses.map(address => ({
      id: address.id,
      userId: address.user_id,
      addressLine1: address.address_line_1,
      addressLine2: address.address_line_2,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude,
      googlePlaceId: address.google_place_id,
      isDefault: address.is_default,
      createdAt: address.created_at,
      updatedAt: address.updated_at
    }));

    res.status(200).json({
      success: true,
      addresses: transformedAddresses,
      count: transformedAddresses.length
    });

  } catch (error) {
    logger.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /:id - Update address
router.put('/:id', [
  param('id').isUUID().withMessage('Valid Address ID is required'),
  body('addressLine1').optional().notEmpty().withMessage('Address line 1 cannot be empty'),
  body('addressLine2').optional().isString(),
  body('city').optional().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().notEmpty().withMessage('State cannot be empty'),
  body('postalCode').optional().notEmpty().withMessage('Postal code cannot be empty'),
  body('country').optional().isString(),
  body('latitude').optional().isFloat(),
  body('longitude').optional().isFloat(),
  body('googlePlaceId').optional().isString(),
  body('isDefault').optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    logger.info('Updating address:', { addressId: id });

    // 1. Check if address exists and get user_id
    const { data: existingAddress, error: checkError } = await supabase
      .from('guest_addresses')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (checkError || !existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // 2. If setting as default, unset other default addresses for this user
    if (updateData.isDefault) {
      await supabase
        .from('guest_addresses')
        .update({ is_default: false })
        .eq('user_id', existingAddress.user_id)
        .neq('id', id);
    }

    // 3. Prepare update data
    const dbUpdateData = {};
    if (updateData.addressLine1) dbUpdateData.address_line_1 = updateData.addressLine1;
    if (updateData.addressLine2 !== undefined) dbUpdateData.address_line_2 = updateData.addressLine2;
    if (updateData.city) dbUpdateData.city = updateData.city;
    if (updateData.state) dbUpdateData.state = updateData.state;
    if (updateData.postalCode) dbUpdateData.postal_code = updateData.postalCode;
    if (updateData.country) dbUpdateData.country = updateData.country;
    if (updateData.latitude !== undefined) dbUpdateData.latitude = updateData.latitude;
    if (updateData.longitude !== undefined) dbUpdateData.longitude = updateData.longitude;
    if (updateData.googlePlaceId !== undefined) dbUpdateData.google_place_id = updateData.googlePlaceId;
    if (updateData.isDefault !== undefined) dbUpdateData.is_default = updateData.isDefault;
    dbUpdateData.updated_at = new Date().toISOString();

    // 4. Update address
    const { data: address, error } = await supabase
      .from('guest_addresses')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update address:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update address'
      });
    }

    logger.info('Address updated successfully:', { addressId: id });

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address: {
        id: address.id,
        userId: address.user_id,
        addressLine1: address.address_line_1,
        addressLine2: address.address_line_2,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country,
        latitude: address.latitude,
        longitude: address.longitude,
        googlePlaceId: address.google_place_id,
        isDefault: address.is_default,
        createdAt: address.created_at,
        updatedAt: address.updated_at
      }
    });

  } catch (error) {
    logger.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;