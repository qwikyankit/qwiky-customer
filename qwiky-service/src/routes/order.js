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

// GET /api/orders/:userId
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

// GET /api/orders/details/:orderId
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