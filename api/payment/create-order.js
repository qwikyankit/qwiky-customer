// Backend API endpoint for creating Cashfree payment orders
// This would typically be deployed as a serverless function or Express.js route

// Add test endpoint for connectivity check
async function testEndpoint(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Payment API is accessible',
    environment: process.env.CASHFREE_ENV || 'TEST'
  });
}

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

// Helper function to generate signature
function generateSignature(postData, secretKey) {
  const signatureData = Object.keys(postData)
    .sort()
    .map(key => `${key}=${postData[key]}`)
    .join('&');
  
  return crypto
    .createHmac('sha256', secretKey)
    .update(signatureData)
    .digest('base64');
}

// Main handler function
async function createCashfreeOrder(req, res) {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

    // Extract request data
    const {
      order_id,
      order_amount,
      order_currency = 'INR',
      customer_details,
      order_meta
    } = req.body;

    // Validate required fields
    if (!order_id || !order_amount || !customer_details) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: order_id, order_amount, customer_details'
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

    // Prepare order data for Cashfree
    const orderData = {
      order_id: order_id,
      order_amount: parseFloat(order_amount),
      order_currency: order_currency,
      customer_details: {
        customer_id: customer_details.customer_id,
        customer_name: customer_details.customer_name,
        customer_email: customer_details.customer_email,
        customer_phone: customer_details.customer_phone
      },
      order_meta: {
        return_url: order_meta?.return_url || `${req.headers.origin}/payment/callback`,
        notify_url: order_meta?.notify_url || `${req.headers.origin}/api/payment/webhook`
      }
    };

    console.log('Creating Cashfree order:', {
      orderId: orderData.order_id,
      amount: orderData.order_amount,
      currency: orderData.order_currency,
      customerId: orderData.customer_details.customer_id,
      environment: isProduction ? 'production' : 'test'
    });

    // Make API call to Cashfree
    const response = await fetch(`${config.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': config.appId,
        'x-client-secret': config.secretKey
      },
      body: JSON.stringify(orderData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Cashfree API error:', responseData);
      return res.status(response.status).json({
        success: false,
        message: responseData.message || 'Failed to create payment order',
        error: responseData
      });
    }

    console.log('Cashfree order created successfully:', {
      orderId: responseData.order_id,
      sessionId: responseData.payment_session_id
    });

    // Return success response
    return res.status(200).json({
      payment_session_id: responseData.payment_session_id,
      order_id: responseData.order_id,
      order_status: responseData.order_status,
      return_url: orderData.order_meta.return_url,
      cashfree_order_id: responseData.cf_order_id,
      environment: isProduction ? 'production' : 'sandbox'
    });

  } catch (error) {
    console.error('Error creating Cashfree order:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Export for different deployment platforms
module.exports = createCashfreeOrder;
module.exports.testEndpoint = testEndpoint;

// For Vercel
module.exports.default = createCashfreeOrder;

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
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify(data)
      })
    })
  };
  
  return await createCashfreeOrder(req, res);
};