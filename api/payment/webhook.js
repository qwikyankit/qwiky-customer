// Backend API endpoint for handling Cashfree payment webhooks
// This would typically be deployed as a serverless function or Express.js route

const crypto = require('crypto');

// Helper function to verify webhook signature
function verifyWebhookSignature(rawBody, signature, secretKey) {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawBody)
      .digest('base64');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Main handler function
async function handleCashfreeWebhook(req, res) {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

    // Get raw body and signature
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-webhook-signature'];

    // Determine environment and get secret key
    const isProduction = process.env.CASHFREE_ENV === 'PRODUCTION';
    const secretKey = isProduction 
      ? process.env.CASHFREE_SECRET_KEY_PROD 
      : process.env.CASHFREE_SECRET_KEY;

    // Verify webhook signature (recommended for production)
    if (process.env.NODE_ENV === 'production' && signature) {
      const isValidSignature = verifyWebhookSignature(rawBody, signature, secretKey);
      
      if (!isValidSignature) {
        console.error('Invalid webhook signature');
        return res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
    }

    // Extract webhook data
    const webhookData = req.body;
    const { type, data } = webhookData;

    console.log('Received Cashfree webhook:', {
      type: type,
      orderId: data?.order?.order_id,
      paymentStatus: data?.payment?.payment_status,
      environment: isProduction ? 'production' : 'test'
    });

    // Handle different webhook types
    switch (type) {
      case 'PAYMENT_SUCCESS_WEBHOOK':
        await handlePaymentSuccess(data);
        break;
      
      case 'PAYMENT_FAILED_WEBHOOK':
        await handlePaymentFailure(data);
        break;
      
      case 'PAYMENT_USER_DROPPED_WEBHOOK':
        await handlePaymentDropped(data);
        break;
      
      default:
        console.log('Unhandled webhook type:', type);
    }

    // Always return success to acknowledge webhook receipt
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Error processing Cashfree webhook:', error);
    
    // Return success even on error to prevent webhook retries
    // Log the error for investigation
    return res.status(200).json({
      success: false,
      message: 'Webhook processing failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Handle successful payment
async function handlePaymentSuccess(data) {
  try {
    const { order, payment } = data;
    
    console.log('Processing successful payment:', {
      orderId: order.order_id,
      paymentId: payment.cf_payment_id,
      amount: payment.payment_amount
    });

    // Here you would typically:
    // 1. Update order status in your database
    // 2. Send confirmation email/SMS to customer
    // 3. Trigger any post-payment workflows
    // 4. Update inventory if applicable

    // Example database update (pseudo-code):
    // await updateOrderStatus(order.order_id, 'PAID');
    // await sendPaymentConfirmation(order.customer_email);

    console.log('Payment success processed for order:', order.order_id);
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

// Handle failed payment
async function handlePaymentFailure(data) {
  try {
    const { order, payment } = data;
    
    console.log('Processing failed payment:', {
      orderId: order.order_id,
      paymentId: payment?.cf_payment_id,
      failureReason: payment?.payment_message
    });

    // Here you would typically:
    // 1. Update order status in your database
    // 2. Send failure notification to customer
    // 3. Log failure reason for analysis

    // Example database update (pseudo-code):
    // await updateOrderStatus(order.order_id, 'FAILED');
    // await sendPaymentFailureNotification(order.customer_email);

    console.log('Payment failure processed for order:', order.order_id);
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

// Handle payment dropped by user
async function handlePaymentDropped(data) {
  try {
    const { order } = data;
    
    console.log('Processing dropped payment:', {
      orderId: order.order_id
    });

    // Here you would typically:
    // 1. Update order status in your database
    // 2. Maybe send a reminder email to complete payment

    // Example database update (pseudo-code):
    // await updateOrderStatus(order.order_id, 'ABANDONED');

    console.log('Payment drop processed for order:', order.order_id);
  } catch (error) {
    console.error('Error handling payment drop:', error);
    throw error;
  }
}

// Export for different deployment platforms
module.exports = handleCashfreeWebhook;

// For Vercel
module.exports.default = handleCashfreeWebhook;

// For Netlify Functions
exports.handler = async (event, context) => {
  const req = {
    method: event.httpMethod,
    body: JSON.parse(event.body || '{}'),
    headers: event.headers
  };
  
  const res = {
    status: (code) => ({
      json: (data) => ({
        statusCode: code,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, x-webhook-signature',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify(data)
      })
    })
  };
  
  return await handleCashfreeWebhook(req, res);
};