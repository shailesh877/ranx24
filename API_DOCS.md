# YelloCaps API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Send OTP
```http
POST /auth/send-otp
```

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "otp": "1234",
  "expiresIn": 300
}
```

**Rate Limiting:** 3 requests per 15 minutes per phone number

---

### Verify OTP
```http
POST /auth/verify-otp
```

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "1234"
}
```

**Response:**
```json
{
  "message": "Login Successful",
  "user": { ... },
  "token": "jwt_token_here",
  "userType": "user"
}
```

---

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com"
}
```

---

## Worker Endpoints

### Get Workers (with pagination)
```http
GET /workers?page=1&limit=10&category=Electrician&minRating=4
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `category` (optional): Filter by category
- `subcategory` (optional): Filter by service
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `minRating` (optional): Minimum rating
- `latitude` (optional): User latitude for distance calculation
- `longitude` (optional): User longitude
- `maxDistance` (optional): Maximum distance in km (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

---

### Register Worker
```http
POST /workers/register
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `firstName`: string
- `lastName`: string
- `mobileNumber`: string
- `state`: string
- `city`: string
- `categories`: array
- `services`: array
- `livePhoto`: file
- `aadhaarCard`: file
- `aadhaarNumber`: string
- `servicePricing`: JSON string

---

## Booking Endpoints

### Get My Bookings (with pagination)
```http
GET /bookings/my?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { ... }
}
```

---

### Create Booking
```http
POST /bookings
```

**Request Body:**
```json
{
  "workerId": "worker_id",
  "category": "Electrician",
  "service": "Wiring",
  "bookingDate": "2025-11-26",
  "bookingTime": "10:00 AM",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  },
  "price": 500,
  "couponCode": "SAVE10",
  "coinsUsed": 50
}
```

---

## Category Endpoints

### Get All Categories (cached)
```http
GET /categories
```

**Response:**
```json
[
  {
    "_id": "category_id",
    "name": "Electrician",
    "image": "/uploads/electrician.jpg",
    "subCategories": [...]
  }
]
```

**Cache:** 30 minutes

---

## Wallet Endpoints

### Get My Wallet
```http
GET /wallet/me
```

**Response:**
```json
{
  "balance": 1000,
  "ycCoins": 50,
  "transactions": [...]
}
```

---

### Add Funds
```http
POST /wallet/add
```

**Request Body:**
```json
{
  "amount": 500,
  "note": "Added via UPI"
}
```

---

## YC Coins Endpoints

### Get My Coins
```http
GET /coins/my-balance
```

**Response:**
```json
{
  "balance": 100,
  "totalEarned": 500,
  "totalSpent": 400,
  "transactions": [...]
}
```

---

### Calculate Coin Usage
```http
POST /coins/calculate
```

**Request Body:**
```json
{
  "bookingAmount": 1000
}
```

**Response:**
```json
{
  "userBalance": 100,
  "coinsToUse": 50,
  "rupeeDiscount": 50,
  "maxCoinsAllowed": 50,
  "maxUsagePercentage": 50,
  "coinToRupeeRate": 1
}
```

---

## Worker Availability Endpoints

### Set Availability
```http
PUT /availability/set
```

**Headers:**
```
Authorization: Bearer <worker_token>
```

**Request Body:**
```json
{
  "isAvailable": true
}
```

---

### Get Worker Availability
```http
GET /availability/:workerId
```

**Response:**
```json
{
  "isAvailable": true,
  "workingHours": {
    "monday": { "start": "09:00", "end": "18:00", "isWorking": true },
    ...
  }
}
```

---

## Payment Endpoints

### Create Razorpay Order
```http
POST /payment/order
```

**Request Body:**
```json
{
  "amount": 1000
}
```

**Response:**
```json
{
  "id": "order_id",
  "amount": 100000,
  "currency": "INR"
}
```

---

### Verify Payment
```http
POST /payment/verify
```

**Request Body:**
```json
{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature"
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Invalid input data"
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Invalid token. Please log in again!"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

**429 Too Many Requests:**
```json
{
  "message": "Too many OTP requests. Please try again after X minute(s)."
}
```

**500 Server Error:**
```json
{
  "status": "error",
  "message": "Something went wrong!"
}
```

---

## Rate Limiting

- **General API:** 100 requests per 15 minutes per IP
- **OTP Endpoints:** 3 requests per 15 minutes per phone number
- **OTP Attempts:** Maximum 5 wrong attempts per OTP

---

## Notes

1. All timestamps are in ISO 8601 format
2. Pagination is available on list endpoints (workers, bookings, etc.)
3. Categories are cached for 30 minutes
4. Images are served from `/uploads` directory
5. WebSocket support available for real-time notifications
