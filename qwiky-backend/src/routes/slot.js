const express = require('express');
const { param, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { logger } = require('../utils/logger');

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

// GET /test - Test endpoint for slot routes
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Slot API working 🚀',
    timestamp: new Date().toISOString(),
    service: 'slot-service'
  });
});

// GET /:locality - Get available slots by locality
router.get('/:locality', [
  param('locality').notEmpty().withMessage('Locality is required')
], validateRequest, async (req, res) => {
  try {
    const { locality } = req.params;
    const { date } = req.query;

    logger.info('Fetching slots for locality:', { locality, date });

    // For now, we'll generate dynamic slots based on locality
    // In a real application, you might have a time_slots table
    const slots = generateSlotsForLocality(locality, date);

    res.status(200).json({
      success: true,
      slots: slots,
      locality: locality,
      date: date || new Date().toISOString().split('T')[0],
      count: slots.length
    });

  } catch (error) {
    logger.error('Get slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to generate slots based on locality
function generateSlotsForLocality(locality, date) {
  const slots = [];
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  // Base time slots
  const morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  const afternoonSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
  const eveningSlots = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
  
  let allSlots = [...morningSlots, ...afternoonSlots, ...eveningSlots];
  
  // Modify slots based on locality
  if (locality.toLowerCase().includes('sodala')) {
    // Remove 2PM slot for Sodala
    allSlots = allSlots.filter(slot => slot !== '14:00');
  }
  
  // Generate slot objects
  allSlots.forEach((time, index) => {
    const [hours, minutes] = time.split(':');
    const endHour = parseInt(hours) + (minutes === '30' ? 1 : 0);
    const endMinute = minutes === '30' ? '00' : '30';
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute}`;
    
    slots.push({
      id: `slot-${locality}-${time}-${targetDate}`,
      startTime: time,
      endTime: endTime,
      date: targetDate,
      locality: locality,
      isAvailable: Math.random() > 0.2, // 80% availability
      maxCapacity: 5,
      currentBookings: Math.floor(Math.random() * 3), // Random current bookings
      period: getPeriod(time)
    });
  });
  
  return slots;
}

// Helper function to determine time period
function getPeriod(time) {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 15) return 'afternoon';
  return 'evening';
}

module.exports = router;