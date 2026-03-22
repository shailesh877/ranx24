# RanX24 - Service Booking Platform

A full-stack MERN application for booking local services (Electricians, Plumbers, etc.) with real-time notifications, payment integration, and admin management.

## 🚀 Features

### User Features
- 🔐 OTP-based authentication
- 🔍 Advanced search with filters (price, rating)
- 💳 Online payment via Razorpay (Test Mode)
- 🛒 Shopping cart for multiple bookings
- ⭐ Review and rate workers
- 💬 Help & support ticket system
- 🔔 Real-time booking notifications
- 💰 Wallet system with YC Coins rewards

### Worker Features
- 📝 Profile management
- 📅 Booking management
- ⭐ Reviews and ratings display
- 💬 Support system
- 🔔 Real-time job notifications

### Admin Features
- 👥 User and worker management
- ✅ Worker verification and approval
- 📊 Booking oversight
- 💬 Help desk (User & Worker tickets)
- 🏷️ Category and city management

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io (Real-time)
- Razorpay (Payments)
- Joi (Validation)
- Helmet & Rate Limiting (Security)

**Frontend:**
- React + Vite
- TailwindCSS
- React Router
- Axios
- Socket.io Client
- React Hot Toast

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or Atlas)
- Razorpay Account (Test Mode)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd yello-capp-mern
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/RanX24
JWT_SECRET=your_super_secret_jwt_key_here_min_256_bits
YC_REWARD_PERCENTAGE=2

# Razorpay Keys (Get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
```

Start backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Access app at: `http://localhost:5173`

## 🔑 Test Credentials

### Admin Login
- Phone: `9999999999`
- OTP: Check server console

### Test Payment Cards (Razorpay)
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

## 📚 API Documentation

### Authentication
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP & Login

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - User bookings
- `PATCH /api/bookings/:id/status` - Update status

### Reviews
- `POST /api/reviews` - Submit review
- `GET /api/reviews/worker/:workerId` - Get worker reviews

### Support
- `POST /api/support` - Create ticket
- `GET /api/support/my` - My tickets
- `POST /api/support/:id/message` - Send message

### Payment
- `POST /api/payment/order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

## 🔒 Security Features

✅ Input validation (Joi)  
✅ Rate limiting (100 req/15min)  
✅ Secure HTTP headers (Helmet)  
✅ CORS restricted to frontend origin  
✅ JWT authentication  
✅ Password-less OTP login  

## 🚀 Deployment

### Backend (Render/Railway)
1. Create new Web Service
2. Connect GitHub repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables

### Frontend (Vercel/Netlify)
1. Connect GitHub repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Deploy

### Database (MongoDB Atlas)
1. Create cluster
2. Whitelist IPs
3. Update `MONGO_URI` in `.env`

## 📝 TODO (Future Enhancements)

- [ ] Email/SMS OTP integration (Twilio)
- [ ] Redis for session management
- [ ] Push notifications (FCM)
- [ ] Worker KYC verification
- [ ] Image compression
- [ ] Review moderation
- [ ] Analytics dashboard
- [ ] Multi-language support

## 📄 License

MIT License

## 👨‍💻 Developer

Built with ❤️ using MERN Stack

---

**Need help? Create a ticket in the app's support section!**
