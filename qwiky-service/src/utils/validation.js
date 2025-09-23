const { logger } = require('./logger');

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CASHFREE_APP_ID',
  'CASHFREE_SECRET_KEY'
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    logger.error('Missing required environment variables:', { missing });
    process.exit(1);
  }

  // Validate Cashfree environment
  if (!['TEST', 'PRODUCTION'].includes(process.env.CASHFREE_ENV)) {
    logger.error('CASHFREE_ENV must be either TEST or PRODUCTION');
    process.exit(1);
  }

  // If production, check for production keys
  if (process.env.CASHFREE_ENV === 'PRODUCTION') {
    if (!process.env.CASHFREE_APP_ID_PROD || !process.env.CASHFREE_SECRET_KEY_PROD) {
      logger.error('Production Cashfree credentials required when CASHFREE_ENV=PRODUCTION');
      process.exit(1);
    }
  }

  logger.info('✅ Environment validation passed');
};

module.exports = { validateEnv };