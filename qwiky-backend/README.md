# Qwiky Backend - API Service

A production-ready Node.js backend service for the Qwiky home service booking application with Cashfree payment integration and Supabase database.

## 🚀 Quick Deploy

### Deploy to Render (Recommended)

1. **Fork this repository** to your GitHub account

2. **Create a new Web Service** on [Render](https://render.com):
   - Connect your GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Set Environment Variables** in Render Dashboard:
   ```
   NODE_ENV=production
   PORT=3001
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   CASHFREE_APP_ID=your_cashfree_test_app_id
   CASHFREE_SECRET_KEY=your_cashfree_test_secret_key
   CASHFREE_ENV=TEST
   FRONTEND_URL=https://your-frontend-domain.com
   ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:5173
   ```

4. **Deploy** - Render will automatically build and deploy your service

5. **Get your API URL**: `https://your-service-name.onrender.com`

### Deploy to Vercel Functions

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel Dashboard

## 📋 API Endpoints

### 🔍 Test Endpoint
```bash
GET /health
GET /api/payment/test
```

### 👤 User APIs
```bash
POST /api/user/signup
GET /api/user/:id
PUT /api/user/:id
```

### 🏠 Address APIs
```bash
POST /api/address
GET /api/address/:userId
PUT /api/address/:id
```

### 🛠️ Service APIs
```bash
GET /api/services
GET /api/services/:id
```

### 📅 Slot APIs
```bash
GET /api/slots/:locality
```

### 📦 Order APIs
```bash
POST /api/orders
GET /api/orders/:userId
GET /api/orders/details/:orderId
```

### 💳 Payment APIs
```bash
POST /api/payment/create-order
GET /api/payment/verify/:orderId
POST /api/payment/webhook
```

## 🧪 Testing APIs

### Using cURL

**Test Health:**
```bash
curl https://your-api-url.com/health
```

**Create User:**
```bash
curl -X POST https://your-api-url.com/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","name":"Test User","email":"test@example.com"}'
```

**Get Services:**
```bash
curl https://your-api-url.com/api/services
```

**Create Payment Order:**
```bash
curl -X POST https://your-api-url.com/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_123",
    "userId": "user-uuid",
    "serviceId": "service-uuid",
    "amount": 154,
    "customerDetails": {
      "customerPhone": "+919876543210",
      "customerName": "Test User"
    }
  }'
```

### Using Postman

Import this collection URL:
```
https://your-api-url.com/api/docs
```

## 🔧 Local Development

1. **Clone & Install**:
   ```bash
   git clone https://github.com/your-username/qwiky-backend.git
   cd qwiky-backend
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start Development**:
   ```bash
   npm run dev
   ```

4. **Test Locally**:
   ```bash
   curl http://localhost:3001/health
   ```

## 🔐 Environment Variables

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
- `ALLOWED_ORIGINS` - Comma-separated allowed origins
- `LOG_LEVEL` - Logging level (error/warn/info/debug)

## 🎯 Frontend Integration

Update your frontend `.env`:
```env
VITE_API_BASE_URL=https://your-backend-url.com
VITE_PAYMENT_MODE=cashfree-test
```

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Logs**: Check your deployment platform's logs
- **Errors**: All errors are logged with timestamps

## 🔒 Security Features

- Rate limiting (100 requests/15min)
- CORS protection
- Input validation
- Security headers
- Environment isolation

## 🚀 Production Ready

- ✅ Dockerized
- ✅ Auto-deployment via GitHub Actions
- ✅ Comprehensive error handling
- ✅ Logging & monitoring
- ✅ Security best practices
- ✅ Scalable architecture

## 📞 Support

For issues:
1. Check deployment logs
2. Verify environment variables
3. Test endpoints with cURL
4. Check Supabase connection

**Your backend is now ready for production! 🎉**