// Backend API endpoint for verifying Cashfree payment status
// This would typically be deployed as a serverless function or Express.js route

// Cashfree configuration
const CASHFREE_CONFIG = {
  test: {
    baseUrl: 'https://sandbox.cashfree.com/pg',
    appId: process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_SECRET_KEY
  },
  production: {
    baseUrl: 'https://api.cashfree.com/pg',
    appId: process.env.CASHFREE_APP_ID_PROD,
    secretKey: process.env.CASHFREE_SECRET_KEY_PROD
  }
};

// Main handler function
async function verifyCashfreePayment(req, res) {
  try {
    // Validate request method
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

    // Extract order ID from URL parameters
    const orderId = req.query.orderId || req.params?.orderId;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Determine environment (test or production)
    const isProduction = process.env.CASHFREE_ENV === 'PRODUCTION';
    const config = isProduction ? CASHFREE_CONFIG.production : CASHFREE_CONFIG.test;

    // Validate configuration
    if (!config.appId || !config.secretKey) {
      console.error('Cashfree configuration missing:', {
        appId: !!config.appId,
        secretKey: !!config.secretKey,
        environment: isProduction ? 'production' : 'test'
      });
      
      return res.status(500).json({
        success: false,
        message: 'Payment service configuration error'
      });
    }

    console.log('Verifying Cashfree payment:', {
      orderId: orderId,
      environment: isProduction ? 'production' : 'test'
    });

    // Make API call to Cashfree to get order status
    const response = await fetch(`${config.baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': config.appId,
        'x-client-secret': config.secretKey
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Cashfree verification API error:', responseData);
      return res.status(response.status).json({
        success: false,
        message: responseData.message || 'Failed to verify payment',
        error: responseData
      });
    }

    console.log('Cashfree payment verification result:', {
      orderId: responseData.order_id,
      orderStatus: responseData.order_status,
      paymentStatus: responseData.payment_status
    });

    // Return verification result
    return res.status(200).json({
      success: true,
      order_id: responseData.order_id,
      order_status: responseData.order_status,
      payment_status: responseData.payment_status,
      order_amount: responseData.order_amount,
      payment_time: responseData.payment_time,
      cf_order_id: responseData.cf_order_id
    });

  } catch (error) {
    console.error('Error verifying Cashfree payment:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Export for different deployment platforms
module.exports = verifyCashfreePayment;

// For Vercel
module.exports.default = verifyCashfreePayment;

// For Netlify Functions
exports.handler = async (event, context) => {
  const req = {
    method: event.httpMethod,
    query: event.queryStringParameters || {},
    params: event.pathParameters || {},
    headers: event.headers
  };
  
  const res = {
    status: (code) => ({
      json: (data) => ({
        statusCode: code,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify(data)
      })
    })
  };
  
  return await verifyCashfreePayment(req, res);
};