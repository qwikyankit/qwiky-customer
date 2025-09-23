// Test endpoint to check if payment API is accessible
async function testPaymentAPI(req, res) {
  try {
    // Validate request method
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

    // Check environment configuration
    const isProduction = process.env.CASHFREE_ENV === 'PRODUCTION';
    const hasTestConfig = !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
    const hasProdConfig = !!(process.env.CASHFREE_APP_ID_PROD && process.env.CASHFREE_SECRET_KEY_PROD);

    const configStatus = {
      environment: isProduction ? 'production' : 'test',
      testConfigured: hasTestConfig,
      prodConfigured: hasProdConfig,
      currentConfigured: isProduction ? hasProdConfig : hasTestConfig
    };

    return res.status(200).json({
      success: true,
      message: 'Payment API is accessible',
      timestamp: new Date().toISOString(),
      configuration: configStatus
    });

  } catch (error) {
    console.error('Error in test endpoint:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Export for different deployment platforms
module.exports = testPaymentAPI;

// For Vercel
module.exports.default = testPaymentAPI;

// For Netlify Functions
exports.handler = async (event, context) => {
  const req = {
    method: event.httpMethod,
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
  
  return await testPaymentAPI(req, res);
};