# Qwiky Service - Backend API

A production-ready Node.js backend service for the Qwiky home service booking application with Cashfree payment integration and Supabase database.

## Features

- **Payment Processing**: Complete Cashfree integration for test and live environments
- **Database Integration**: Supabase PostgreSQL with comprehensive schema
- **Order Management**: Full booking lifecycle management
- **User Management**: User registration and profile management
- **Security**: Rate limiting, CORS, input validation, and secure headers
- **Logging**: Comprehensive logging with different levels
- **Error Handling**: Structured error responses and logging
- **Containerization**: Docker support for easy deployment

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Payment Gateway**: Cashfree
- **Validation**: Joi + express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Custom logger with file output
- **Containerization**: Docker

## API Endpoints

### Payment APIs
- `POST /api/payment/create-order` - Create Cashfree payment order
- `GET /api/payment/verify/:orderId` - Verify payment status
- `POST /api/payment/webhook` - Handle Cashfree webhooks
- `GET /api/payment/test` - Test endpoint

### User APIs
- `POST /api/user/signup` - Create new user
- `GET /api/user/:userId` - Get user details

### Order APIs
- `GET /api/orders/:userId` - Get user orders
- `GET /api/orders/details/:orderId` - Get order details

### Service APIs
- `GET /api/services` - Get all active services
- `GET /api/services/:serviceId` - Get service details

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure environment variables:
```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cashfree
CASHFREE_APP_ID=your_test_app_id
CASHFREE_SECRET_KEY=your_test_secret_key
CASHFREE_ENV=TEST

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Installation & Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Start production server:
```bash
npm start
```

## Database Schema

The service expects the following Supabase tables:
- `users` - User accounts
- `services` - Available services
- `orders` - Booking orders
- `order_items` - Order line items
- `transactions` - Payment transactions
- `guest_addresses` - User addresses

## Docker Deployment

1. Build Docker image:
```bash
docker build -t qwiky-service .
```

2. Run container:
```bash
docker run -p 3001:3001 --env-file .env qwiky-service
```

## Deployment Options

### 1. Render
- Connect your GitHub repository
- Set environment variables in Render dashboard
- Auto-deploy on push to main branch

### 2. Railway
- Connect GitHub repository
- Configure environment variables
- Deploy with one click

### 3. Vercel Functions
- Deploy as serverless functions
- Configure environment variables
- Auto-deploy via GitHub integration

### 4. Supabase Edge Functions
- Deploy individual functions to Supabase
- Use Deno runtime
- Integrated with Supabase database

## Environment Variables

### Required
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `CASHFREE_APP_ID` - Cashfree application ID
- `CASHFREE_SECRET_KEY` - Cashfree secret key
- `CASHFREE_ENV` - TEST or PRODUCTION

### Optional
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `LOG_LEVEL` - Logging level (error/warn/info/debug)

## Payment Flow

1. **Create Order**: Frontend calls `/api/payment/create-order`
2. **Database Storage**: Order and transaction stored in Supabase
3. **Cashfree Integration**: Real payment session created
4. **Payment Processing**: User redirected to Cashfree checkout
5. **Callback Handling**: Payment status updated via webhook/verification
6. **Order Completion**: Final status stored in database

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Helmet.js for security headers
- **Error Handling**: No sensitive data in error responses
- **Environment Isolation**: Separate test/production configurations

## Monitoring & Logging

- **Request Logging**: Morgan middleware for HTTP requests
- **Application Logging**: Custom logger with levels
- **Error Tracking**: Comprehensive error logging
- **Health Checks**: `/health` endpoint for monitoring

## Testing

Run tests:
```bash
npm test
```

The service includes comprehensive tests for:
- API endpoints
- Payment integration
- Database operations
- Error handling

## Production Checklist

- [ ] Environment variables configured
- [ ] Supabase database schema deployed
- [ ] Cashfree credentials verified
- [ ] CORS origins configured
- [ ] Rate limiting configured
- [ ] Logging level set appropriately
- [ ] Health checks working
- [ ] SSL/TLS enabled
- [ ] Monitoring configured

## Support

For issues and questions:
1. Check the logs for detailed error information
2. Verify environment variables are correctly set
3. Test Cashfree integration in sandbox mode first
4. Ensure Supabase database schema is up to date

The service is production-ready and can handle real payments and bookings! 🚀