# Qwiky - Service Booking App

A production-ready React.js application for booking home services with authentication, payment integration, and complete booking flow.

## Features

- **Authentication**: Indian mobile number-based signup/login with 4-digit OTP verification
- **Service Booking**: Location-based service selection with time slot booking
- **Payment Integration**: Cashfree Payment Gateway integration
- **Order Management**: Complete booking history and order tracking
- **Responsive Design**: Mobile-first design optimized for all devices
- **Multilingual Support**: Resource-based text management for i18n
- **State Management**: React Context for app-wide state management
- **Error Handling**: Comprehensive error handling and loading states

## Tech Stack

- **Frontend**: React.js 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **Styling**: SCSS with organized variable system
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── booking/        # Booking flow components
│   ├── common/         # Shared components
│   └── routing/        # Route protection components
├── pages/              # Page/screen components
├── context/            # React Context providers
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── styles/             # SCSS stylesheets
├── resources/          # Text resources for i18n
└── config/             # App configuration
```

## Environment Setup

1. Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

2. Configure the following environment variables:

```env
NODE_ENV=development
REACT_APP_API_BASE_URL=your_backend_api_url
REACT_APP_CASHFREE_APP_ID=your_cashfree_app_id
REACT_APP_CASHFREE_SECRET_KEY=your_cashfree_secret_key
REACT_APP_CASHFREE_ENV=TEST
```

## Payment Integration

This app supports multiple payment modes:

### 🔧 Payment Modes

1. **Mock Mode** (`VITE_PAYMENT_MODE=mock`)
   - Simulates payment flow without real transactions
   - Perfect for development and testing
   - No external API calls required

2. **Cashfree Test Mode** (`VITE_PAYMENT_MODE=cashfree-test`)
   - Uses Cashfree sandbox environment
   - Requires backend API integration
   - Test with real Cashfree flow but no actual money

3. **Cashfree Live Mode** (`VITE_PAYMENT_MODE=cashfree-live`)
   - Uses Cashfree production environment
   - Processes real payments
   - Requires production credentials

### 🔧 Setup Instructions

1. **Create Cashfree Account**: [https://www.cashfree.com/](https://www.cashfree.com/)
2. **Get Credentials**: App ID and Secret Key from Cashfree dashboard
3. **Configure Environment**:
   ```env
   # Choose payment mode
   VITE_PAYMENT_MODE=cashfree-test
   
   # Backend credentials
   CASHFREE_APP_ID=your_test_app_id
   CASHFREE_SECRET_KEY=your_test_secret_key
   CASHFREE_ENV=TEST
   ```
4. **Deploy Backend APIs**: The `/api/payment/` endpoints need to be deployed
5. **Test Integration**: Use test mode first, then switch to live

### 🔧 Backend API Requirements

The app requires these backend endpoints:

- `POST /api/payment/create-order` - Create Cashfree payment session
- `GET /api/payment/verify/{orderId}` - Verify payment status  
- `POST /api/payment/webhook` - Handle Cashfree webhooks

Backend files are provided in the `/api/payment/` directory.

## Backend API Requirements

The app expects a REST API backend with the following endpoints:

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile number
- `POST /api/auth/verify-otp` - Verify OTP and return user + token
- `GET /api/auth/me` - Get current user profile

### Booking
- `GET /api/locations` - Get available locations
- `GET /api/services?locationId=` - Get services for location
- `GET /api/time-slots?serviceId=&date=` - Get available time slots
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get specific booking

### Payment
- `POST /api/payments/create-session` - Create payment session
- `POST /api/payments/verify` - Verify payment status

## Installation & Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Deployment

The app is configured for deployment with proper environment variable support:

1. **Development**: Use `.env` file with development settings
2. **Staging**: Use staging environment variables
3. **Production**: Use production environment variables with proper Cashfree production credentials

## Features Implemented

### Core Features
- ✅ Indian mobile number authentication with OTP
- ✅ Location-based service selection
- ✅ Time slot booking system
- ✅ Cashfree payment integration
- ✅ Order history and tracking
- ✅ User profile management

### Technical Features
- ✅ Material-UI component library
- ✅ SCSS styling with variable system
- ✅ React Context state management
- ✅ Protected route system
- ✅ Comprehensive error handling
- ✅ Loading state management
- ✅ Mobile-first responsive design
- ✅ TypeScript for type safety
- ✅ Modular service layer architecture

### Production Ready Features
- ✅ Environment-based configuration
- ✅ Proper error boundaries
- ✅ API retry mechanisms
- ✅ Form validation
- ✅ Security best practices
- ✅ Performance optimizations

The application is fully functional and ready for deployment with a proper backend API.

## 🌐 Deployment Guide

### Frontend Deployment on Render (Static Site)

#### 1. Basic Configuration

**Build Settings**:
- Repository: Connect your GitHub repository
- Build Command: `npm run build`
- Publish Directory: `dist`
- Environment: `Node`

#### 2. Environment Variables

Set these in Render Dashboard → Environment:
```env
VITE_API_URL=https://qwiky-backend.onrender.com
VITE_FRONTEND_URL=https://qwiky-customer.onrender.com
VITE_PAYMENT_MODE=cashfree-test
VITE_CASHFREE_ENV=SANDBOX
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

#### 3. SPA Routing Configuration (CRITICAL)

**Option A: Automatic (Recommended)**
The project includes a `public/_redirects` file that automatically configures SPA routing:
```
/*    /index.html   200
```

**Option B: Manual Configuration**
If the `_redirects` file doesn't work, manually configure in Render Dashboard:

1. Go to **Static Site** → **Settings** → **Redirects and Rewrites**
2. Add this rewrite rule:
   ```
   Source: /*
   Destination: /index.html
   Action: Rewrite
   ```

#### 4. Why This Is Critical

Without SPA routing configuration:
- ❌ `/payment/callback?order_id=123` returns 404
- ❌ `/orders` returns 404 on page refresh
- ❌ Deep links don't work

With proper configuration:
- ✅ All React Router routes work correctly
- ✅ Payment callbacks from Cashfree work
- ✅ Users can refresh any page without errors
- ✅ Deep links work properly

#### 5. Testing Deep Links

After deployment, verify these URLs work:
```bash
# These should load the React app, not return 404:
https://qwiky-customer.onrender.com/payment/callback?order_id=123
https://qwiky-customer.onrender.com/orders
https://qwiky-customer.onrender.com/profile
https://qwiky-customer.onrender.com/payment/success?order_id=123
```

### Backend Deployment on Render (Web Service)

#### 1. Basic Configuration

**Build Settings**:
- Repository: Connect your GitHub repository (qwiky-backend folder)
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

#### 2. Environment Variables

Set these in Render Dashboard → Environment:
   ```env
   NODE_ENV=production
   PORT=3001
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   CASHFREE_APP_ID=your_cashfree_test_app_id
   CASHFREE_SECRET_KEY=your_cashfree_test_secret_key
   CASHFREE_ENV=SANDBOX
   FRONTEND_URL=https://qwiky-customer.onrender.com
   ALLOWED_ORIGINS=https://qwiky-customer.onrender.com,http://localhost:5173
   ```

### API Integration Notes

#### CRITICAL: API URL Configuration

**Backend Configuration**:
- Backend already mounts all routes under `/api`
- Routes: `/api/payment/create-order`, `/api/user/signup`, etc.
- Base URL: `https://qwiky-backend.onrender.com`

**Frontend Configuration**:
- Environment variable: `VITE_API_BASE_URL=https://qwiky-backend.onrender.com/api`
- Frontend code calls: `apiClient.post('/payment/create-order', data)`
- Final URL: `https://qwiky-backend.onrender.com/api/payment/create-order` ✅

**IMPORTANT**: 
- ✅ Correct: `VITE_API_BASE_URL=https://qwiky-backend.onrender.com/api`
- ❌ Wrong: `VITE_API_BASE_URL=https://qwiky-backend.onrender.com` (missing /api)
- ✅ Frontend calls: `apiClient.post('/payment/test')` (no /api prefix in code)
- ❌ Wrong: `apiClient.post('/api/payment/test')` (creates double /api/api/)

#### Payment Flow URLs

1. **Payment Creation**: `POST https://qwiky-backend.onrender.com/api/payment/create-order`
2. **Cashfree Callback**: `GET https://qwiky-backend.onrender.com/api/payment/callback`
3. **Frontend Success**: `https://qwiky-customer.onrender.com/payment/success?order_id=xxx`
4. **Frontend Failure**: `https://qwiky-customer.onrender.com/payment/failed?order_id=xxx`

#### SPA Routing Configuration

**For Render Static Sites**, add this `public/static.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1",
      "status": 200
    },
    {
      "source": "/(.*)",
      "destination": "/index.html",
      "status": 200
    }
  ]
}
```

This ensures:
- `/payment/callback?order_id=123` loads React app (not 404)
- `/api/*` routes are preserved for backend calls
- Deep links work properly
### Troubleshooting

#### Frontend Issues
- **404 on routes**: Check `_redirects` file or manual rewrite rules
- **API errors**: Verify `VITE_API_URL` doesn't include `/api`
- **Payment callback 404**: Ensure SPA routing is configured

#### Backend Issues  
- **CORS errors**: Check `ALLOWED_ORIGINS` includes frontend URL
- **Payment errors**: Verify Cashfree credentials and environment
- **Database errors**: Check Supabase connection and RLS policies


## API Testing & Validation

### Testing the API and Data Flow

1. **Access API Test Page**: Go to Profile → API Testing
2. **Run API Tests**: Tests all CRUD operations (Create, Read, Update, Delete)
3. **Run Data Flow Validation**: Validates database connection and structure

### API Endpoints Available

#### User Management
- `createUser(userData)` - Create new user
- `getUser(id)` - Get user by ID
- `updateUser(id, userData)` - Update user information

#### Address Management
- `createGuestAddress(addressData)` - Add new address
- `getUserAddresses(userId)` - Get all user addresses
- `updateGuestAddress(id, addressData)` - Update address

#### Service Management
- `getServices()` - Get all available services
- `getService(id)` - Get specific service

#### Cart Management
- `addToCart(cartData)` - Add item to cart
- `getCartItems(userId)` - Get user's cart items
- `updateCartItem(id, cartData)` - Update cart item
- `removeFromCart(id)` - Remove item from cart

#### Order Management
- `createOrder(orderData, orderItems)` - Create new order
- `getOrder(id)` - Get order details
- `getUserOrders(userId)` - Get user's order history
- `updateOrderStatus(id, status)` - Update order status

#### Transaction Management
- `createTransaction(transactionData)` - Create payment transaction
- `updateTransaction(id, transactionData)` - Update transaction status

### Database Schema

The app uses a comprehensive PostgreSQL schema with:
- **Users** - User account management
- **User Addresses** - Address storage with geolocation
- **Services** - Available service types (60min, 90min, 120min)
- **Orders** - Booking management with status tracking
- **Order Items** - Individual service items in orders
- **Transactions** - Payment tracking
- **Cart Items** - Shopping cart functionality

### Data Flow Validation

1. **Database Connection** - Validates Supabase connection
2. **Table Structure** - Ensures all tables are accessible
3. **RLS Policies** - Tests Row Level Security
4. **Data Relationships** - Validates foreign key relationships

### How to Use API Testing

1. **Setup Supabase**:
   - Create project at [supabase.com](https://supabase.com)
   - Run the SQL migration from `supabase/migrations/create_qwiky_schema.sql`
   - Update `.env` with your Supabase credentials

2. **Test API**:
   - Navigate to Profile → API Testing
   - Click "Run API Tests" to test all operations
   - Click "Run Data Flow Validation" to validate database
   - Check browser console for detailed logs

3. **Monitor Results**:
   - Green checkmarks indicate successful operations
   - Red X marks indicate failures with error details
   - Expand accordions to see response data

The testing suite will create, read, update, and delete test data to validate all API endpoints are working correctly.