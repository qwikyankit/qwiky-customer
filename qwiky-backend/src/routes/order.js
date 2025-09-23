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

// GET /test - Test endpoint for order routes
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Order API working 🚀',
    timestamp: new Date().toISOString(),
    service: 'order-service'
  });
});

// POST /api/orders - Create new booking order
router.post('/', [
  body('userId').isUUID().withMessage('Valid User ID is required'),
  body('serviceId').isUUID().withMessage('Valid Service ID is required'),
  body('addressId').optional().isUUID().withMessage('Valid Address ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required'),
  body('notes').optional().isString()
], validateRequest, async (req, res) => {
  try {
    const { userId, serviceId, addressId, scheduledDate, scheduledTime, notes } = req.body;

    logger.info('Creating new order:', { userId, serviceId, scheduledDate, scheduledTime });

    // 1. Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, mobile, name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 2. Verify service exists
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, price, duration_minutes')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single();

    if (serviceError || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or inactive'
      });
    }

    // 3. Verify address if provided
    if (addressId) {
      const { data: address, error: addressError } = await supabase
        .from('guest_addresses')
        .select('id')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single();

      if (addressError || !address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found or does not belong to user'
        });
      }
    }

    // 4. Create order
    const orderData = {
      id: uuidv4(),
      user_id: userId,
      guest_address_id: addressId || null,
      status: 'pending',
      subtotal: service.price,
      discount_amount: 0,
      total_amount: service.price,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      payment_status: 'pending',
      notes: notes || ''
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      logger.error('Failed to create order:', orderError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create order'
      });
    }

    // 5. Create order item
    const orderItemData = {
      id: uuidv4(),
      order_id: order.id,
      service_id: serviceId,
      quantity: 1,
      unit_price: service.price,
      total_price: service.price
    };

    const { error: orderItemError } = await supabase
      .from('order_items')
      .insert([orderItemData]);

    if (orderItemError) {
      logger.error('Failed to create order item:', orderItemError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create order item'
      });
    }

    logger.info('Order created successfully:', { orderId: order.id });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        userId: order.user_id,
        status: order.status,
        paymentStatus: order.payment_status,
        subtotal: order.subtotal,
        totalAmount: order.total_amount,
        scheduledDate: order.scheduled_date,
        scheduledTime: order.scheduled_time,
        notes: order.notes,
        createdAt: order.created_at
      }
    });

  } catch (error) {
    logger.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/orders/:userId - Get all bookings for a user
router.get('/:userId', [
  param('userId').isUUID().withMessage('Valid User ID is required')
], validateRequest, async (req, res) => {
  try {
    const { userId } = req.params;

    logger.info('Fetching orders for user:', { userId });

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          services (
            id,
            name,
            description,
            price,
            duration_minutes
          )
        ),
        guest_addresses (
          id,
          address_line_1,
          address_line_2,
          city,
          state,
          postal_code
        ),
        transactions (
          id,
          payment_gateway,
          amount,
          status,
          gateway_transaction_id,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch orders:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }

    // Transform the data for frontend consumption
    const transformedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      paymentStatus: order.payment_status,
      subtotal: order.subtotal,
      discountAmount: order.discount_amount,
      totalAmount: order.total_amount,
      scheduledDate: order.scheduled_date,
      scheduledTime: order.scheduled_time,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      address: order.guest_addresses,
      items: order.order_items.map(item => ({
        id: item.id,
        serviceId: item.service_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        service: item.services
      })),
      transactions: order.transactions
    }));

    res.status(200).json({
      success: true,
      orders: transformedOrders,
      count: transformedOrders.length
    });

  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/orders/details/:orderId - Get order details
router.get('/details/:orderId', [
  param('orderId').isUUID().withMessage('Valid Order ID is required')
], validateRequest, async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        users (
          id,
          mobile,
          name,
          email
        ),
        order_items (
          *,
          services (
            id,
            name,
            description,
            price,
            duration_minutes
          )
        ),
        guest_addresses (
          *
        ),
        transactions (
          *
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order: order
    });

  } catch (error) {
    logger.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;