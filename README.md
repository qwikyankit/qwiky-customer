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

This app uses Cashfree Payment Gateway. To set up payments:

1. Create a Cashfree account at [https://www.cashfree.com/](https://www.cashfree.com/)
2. Get your App ID and Secret Key from the Cashfree dashboard
3. Update the environment variables with your credentials
4. For production, change `REACT_APP_CASHFREE_ENV` to `PROD`

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