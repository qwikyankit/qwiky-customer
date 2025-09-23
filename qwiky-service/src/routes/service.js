const express = require('express');
const { supabase } = require('../config/supabase');
const { logger } = require('../utils/logger');

const router = express.Router();

// GET /api/services
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching all active services');

    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      logger.error('Failed to fetch services:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch services'
      });
    }

    // Transform the data for frontend consumption
    const transformedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration_minutes,
      durationMinutes: service.duration_minutes,
      categoryId: service.category_id,
      imageUrl: service.image_url,
      isActive: service.is_active,
      createdAt: service.created_at,
      updatedAt: service.updated_at
    }));

    res.status(200).json({
      success: true,
      services: transformedServices,
      count: transformedServices.length
    });

  } catch (error) {
    logger.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/services/:serviceId
router.get('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;

    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single();

    if (error || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or inactive'
      });
    }

    const transformedService = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration_minutes,
      durationMinutes: service.duration_minutes,
      categoryId: service.category_id,
      imageUrl: service.image_url,
      isActive: service.is_active,
      createdAt: service.created_at,
      updatedAt: service.updated_at
    };

    res.status(200).json({
      success: true,
      service: transformedService
    });

  } catch (error) {
    logger.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;