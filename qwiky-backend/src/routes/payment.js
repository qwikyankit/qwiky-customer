const express = require('express');
const { body, param, validationResult } = require('express-validator');
const cashfreeService = require('../config/cashfree');
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

// GET /test - Test endpoint for payment routes
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payment API working 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.CASHFREE_ENV || 'TEST',
    service: 'payment-service'
  });
});

// POST /create-order - Create Cashfree payment order
router.post('/create-order', [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('userId').isUUID().withMessage('Valid User ID is required'),
  body('serviceId').isUUID().withMessage('Valid Service ID is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('customerDetails').isObject().withMessage('Customer details are required'),
  body('customerDetails.customerPhone').notEmpty().withMessage('Customer phone is required'),
  body('customerDetails.customerName').optional(),
  body('customerDetails.customerEmail').optional().isEmail()
], validateRequest, async (req, res) => {
  try {
    const { orderId, userId, serviceId, amount, customerDetails, scheduledDate, scheduledTime, addressId } = req.body;

    logger.info('Creating payment order:', { orderId, userId, serviceId, amount });

    // 1. Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, mobile, name, email')
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

    // 3. Create order in database
    const orderData = {
      id: uuidv4(),
      user_id: userId,
      guest_address_id: addressId || null,
      status: 'pending',
      subtotal: amount,
      discount_amount: 0,
      total_amount: amount,
      scheduled_date: scheduledDate || new Date().toISOString().split('T')[0],
      scheduled_time: scheduledTime || '10:00',
      payment_status: 'pending'
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

    // 4. Create order item
    const orderItemData = {
      id: uuidv4(),
      order_id: order.id,
      service_id: serviceId,
      quantity: 1,
      unit_price: amount,
      total_price: amount
    };

    const { error: orderItemError } = await supabase
      .from('order_items')
      .insert([orderItemData]);

    if (orderItemError) {
      logger.error('Failed to create order item:', orderItemError);
    }

    // 5. Create transaction record
    const transactionData = {
      id: uuidv4(),
      order_id: order.id,
      payment_gateway: 'Cashfree',
      amount: amount,
      currency: 'INR',
      status: 'pending'
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (transactionError) {
      logger.error('Failed to create transaction:', transactionError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create transaction'
      });
    }

    // 6. Create Cashfree order
    const cashfreeOrderData = {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: userId,
        customer_name: customerDetails.customerName || user.name || 'Customer',
        customer_email: customerDetails.customerEmail || user.email || 'customer@example.com',
        customer_phone: customerDetails.customerPhone
      },
      order_meta: {
        return_url: `${req.protocol}://${req.get('host')}/api/payment/callback`,
        notify_url: `${req.protocol}://${req.get('host')}/api/payment/webhook`
      }
    };

    const cashfreeOrder = await cashfreeService.createOrder(cashfreeOrderData);

    // 7. Update transaction with Cashfree order ID
    await supabase
      .from('transactions')
      .update({ 
        gateway_transaction_id: cashfreeOrder.cf_order_id,
        gateway_response: cashfreeOrder
      })
      .eq('id', transaction.id);

    // 8. Return payment session details
    res.status(200).json({
      success: true,
      data: {
        paymentRequestBody: {
          paymentSessionId: cashfreeOrder.payment_session_id,
          returnUrl: cashfreeOrderData.order_meta.return_url
        }
      },
      order: {
        id: order.id,
        orderId: orderId,
        amount: amount,
        status: order.status
      },
      transaction: {
        id: transaction.id,
        status: transaction.status
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

// GET /verify/:orderId - Verify payment status
router.get('/verify/:orderId', [
  param('orderId').notEmpty().withMessage('Order ID is required')
], validateRequest, async (req, res) => {
  try {
    const { orderId } = req.params;

    logger.info('Verifying payment for order:', { orderId });

    // 1. Get Cashfree order status
    const cashfreeOrder = await cashfreeService.getOrderStatus(orderId);

    // 2. Find transaction in database
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select(`
        *,
        orders (
          id,
          user_id,
          status,
          total_amount
        )
      `)
      .eq('gateway_response->order_id', orderId)
      .single();

    if (transactionError || !transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // 3. Update transaction status base