# API Testing Guide

## 🧪 Testing Your Qwiky Backend APIs

### Base URL
Replace `YOUR_API_URL` with your deployed backend URL:
- **Render**: `https://your-service-name.onrender.com`
- **Vercel**: `https://your-project.vercel.app`
- **Local**: `http://localhost:3001`

---

## 🔍 Health Check

```bash
curl https://YOUR_API_URL/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-20T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "service": "qwiky-backend"
}
```

---

## 💳 Payment APIs

### Test Payment Service
```bash
curl https://YOUR_API_URL/api/payment/test
```

### Create Payment Order
```bash
curl -X POST https://YOUR_API_URL/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_123456",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "serviceId": "550e8400-e29b-41d4-a716-446655440001",
    "amount": 154,
    "customerDetails": {
      "customerPhone": "+919876543210",
      "customerName": "Test User",
      "customerEmail": "test@example.com"
    },
    "scheduledDate": "2025-01-25",
    "scheduledTime": "10:00"
  }'
```

### Verify Payment
```bash
curl https://YOUR_API_URL/api/payment/verify/ORDER_123456
```

---

## 👤 User APIs

### Create User
```bash
curl -X POST https://YOUR_API_URL/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "name": "Test User",
    "email": "test@example.com"
  }'
```

### Get User
```bash
curl https://YOUR_API_URL/api/user/550e8400-e29b-41d4-a716-446655440000
```

### Update User
```bash
curl -X PUT https://YOUR_API_URL/api/user/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated User Name",
    "email": "updated@example.com"
  }'
```

---

## 🏠 Address APIs

### Add Address
```bash
curl -X POST https://YOUR_API_URL/api/address \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "addressLine1": "123 Test Street",
    "addressLine2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India",
    "isDefault": true
  }'
```

### Get User Addresses
```bash
curl https://YOUR_API_URL/api/address/550e8400-e29b-41d4-a716-446655440000
```

### Update Address
```bash
curl -X PUT https://YOUR_API_URL/api/address/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -d '{
    "addressLine1": "456 Updated Street",
    "city": "Delhi",
    "isDefault": false
  }'
```

---

## 🛠️ Service APIs

### Get All Services
```bash
curl https://YOUR_API_URL/api/services
```

### Get Specific Service
```bash
curl https://YOUR_API_URL/api/services/550e8400-e29b-41d4-a716-446655440002
```

---

## 📅 Slot APIs

### Get Slots by Locality
```bash
curl https://YOUR_API_URL/api/slots/mumbai-central
```

### Get Slots with Date
```bash
curl "https://YOUR_API_URL/api/slots/mumbai-central?date=2025-01-25"
```

---

## 📦 Order APIs

### Create Order
```bash
curl -X POST https://YOUR_API_URL/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "serviceId": "550e8400-e29b-41d4-a716-446655440001",
    "addressId": "550e8400-e29b-41d4-a716-446655440002",
    "scheduledDate": "2025-01-25",
    "scheduledTime": "10:00",
    "notes": "Please call before arriving"
  }'
```

### Get User Orders
```bash
curl https://YOUR_API_URL/api/orders/550e8400-e29b-41d4-a716-446655440000
```

### Get Order Details
```bash
curl https://YOUR_API_URL/api/orders/details/550e8400-e29b-41d4-a716-446655440003
```

---

## 📋 Postman Collection

### Import Collection
1. Open Postman
2. Click "Import"
3. Paste this URL: `https://YOUR_API_URL/api/docs`
4. Or manually create requests using the cURL commands above

### Environment Variables
Set these in Postman environment:
- `BASE_URL`: `https://YOUR_API_URL`
- `USER_ID`: `550e8400-e29b-41d4-a716-446655440000`
- `SERVICE_ID`: `550e8400-e29b-41d4-a716-446655440001`

---

## 🔧 Testing Workflow

### 1. Complete User Flow Test
```bash
# 1. Create User
curl -X POST https://YOUR_API_URL/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","name":"Test User"}'

# 2. Add Address (use returned user ID)
curl -X POST https://YOUR_API_URL/api/address \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_FROM_STEP_1","addressLine1":"123 Test St","city":"Mumbai","state":"Maharashtra","postalCode":"400001"}'

# 3. Get Services
curl https://YOUR_API_URL/api/services

# 4. Create Order (use IDs from previous steps)
curl -X POST https://YOUR_API_URL/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","serviceId":"SERVICE_ID","addressId":"ADDRESS_ID","scheduledDate":"2025-01-25","scheduledTime":"10:00"}'

# 5. Create Payment (use order details)
curl -X POST https://YOUR_API_URL/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_123","userId":"USER_ID","serviceId":"SERVICE_ID","amount":154,"customerDetails":{"customerPhone":"+919876543210","customerName":"Test User"}}'
```

### 2. Error Testing
```bash
# Test invalid user ID
curl https://YOUR_API_URL/api/user/invalid-uuid

# Test missing required fields
curl -X POST https://YOUR_API_URL/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{}'

# Test invalid service ID
curl https://YOUR_API_URL/api/services/invalid-uuid
```

---

## ✅ Expected Success Responses

All successful API responses follow this format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

## ❌ Expected Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if any */ ]
}
```

---

## 🚀 Quick Verification

Run this one-liner to test all major endpoints:
```bash
echo "Testing Health..." && curl -s https://YOUR_API_URL/health | jq '.status' && \
echo "Testing Payment..." && curl -s https://YOUR_API_URL/api/payment/test | jq '.success' && \
echo "Testing Services..." && curl -s https://YOUR_API_URL/api/services | jq '.success' && \
echo "All tests completed!"
```

**Your APIs are ready for production! 🎉**