// server.js
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import AppError from "./utils/AppError.js";
import globalErrorHandler from "./middleware/errorMiddleware.js";
import validateEnv from "./config/validateEnv.js";

// ES Module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Validate environment variables before starting server
// Validate environment variables before starting server
console.log("Starting environment validation...");
try {
  validateEnv();
  console.log("Validation passed.");
} catch (error) {
  console.error('Environment validation failed:', error.message);
  // Wait for logs to flush before exiting
  setTimeout(() => process.exit(1), 1000);
}

const app = express();
app.set('trust proxy', 'loopback, linklocal, uniquelocal'); // Trust local proxies (Docker/Nginx)

// Security Middleware
import helmet from "helmet";

// CORS Middleware - Must be before routes
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5174",
      "http://localhost:19006",
      "https://www.ranx24.com",
      "https://ranx24.com",
      "https://backend.ranx24.com",
      process.env.CLIENT_URL,
      process.env.ADMIN_URL
    ].filter(Boolean);

    // Merge with ALLOWED_ORIGINS from env if it exists
    if (process.env.ALLOWED_ORIGINS) {
      const envOrigins = process.env.ALLOWED_ORIGINS.split(',');
      allowedOrigins.push(...envOrigins);
    }

    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In development, allow unknown origins for testing
      // In production, block unknown origins for security
      if (isDevelopment) {
        console.log("Unknown origin allowed (development mode):", origin);
        callback(null, true);
      } else {
        console.error("Blocked unknown origin (production mode):", origin);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));

// Helmet Secure Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "*"],
        connectSrc: ["'self'", "ws:", "wss:", "*"],
      },
    },
  })
);

// Rate Limiting - Prevent API abuse
import rateLimit from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // INCREASED LIMIT significantly
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Stricter rate limiting for authentication endpoints - DISABLED TEMPORARILY
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // INCREASED LIMIT
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitization Middleware
import {
  sanitizeMongo,
  sanitizeXSS,
  customSanitize,
} from "./middleware/sanitize.js";
app.use(sanitizeMongo);
app.use(sanitizeXSS);
app.use(customSanitize);

// Static folder to serve Worker uploaded photos/profiles
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Serve public folder for .well-known/assetlinks.json
app.use(express.static(path.join(__dirname, "public")));

// Routes Imports
import adminWorkerRoutes from "./router/adminWorkerRoutes.js";
import adminRoutes from "./router/adminRoutes.js";
import categoryRoutes from "./router/categoryRoutes.js";
import workerRoutes from "./router/workerRoutes.js";
import userRoutes from "./router/userRoutes.js";
import bookingRoutes from "./router/bookingRoutes.js";
import cityRoutes from "./router/cityRoutes.js";
import cartRoutes from "./router/cartRoutes.js";
import authRoutes from "./router/authRoutes.js";
import userwalletRoutes from "./router/userwalletRoutes.js";
import paymentRoutes from "./router/paymentRoutes.js";
import supportRoutes from "./router/supportRoutes.js";
import reviewRoutes from "./router/reviewRoutes.js";
import chatRoutes from "./router/chatRoutes.js";
import bannerRoutes from "./router/bannerRoutes.js";
import couponRoutes from "./router/couponRoutes.js";
import coinsRoutes from "./router/coinsRoutes.js";
import addressRoutes from "./router/addressRoutes.js";
import availabilityRoutes from "./router/availabilityRoutes.js";
import notificationRoutes from "./router/notificationRoutes.js";
import workerAnalyticsRoutes from "./router/workerAnalyticsRoutes.js";
import workerSupportRoutes from "./router/workerSupportRoutes.js";
import workerWalletRoutes from "./router/workerWalletRoutes.js";
import serviceRoutes from "./router/serviceRoutes.js";
import locationRoutes from "./router/locationRoutes.js";
import paymentConfigRoutes from "./router/paymentConfigRoutes.js";
import homeTipRoutes from "./router/homeTipRoutes.js";
import testimonialRoutes from "./router/testimonialRoutes.js";
import membershipRoutes from "./router/membershipRoutes.js";
import amcRoutes from "./router/amcRoutes.js";
import feeRoutes from "./router/feeRoutes.js";
import marriageEventPackageRoutes from "./router/marriageEventPackageRoutes.js";
import marriageEventBookingRoutes from "./router/marriageEventBookingRoutes.js";

// Use Routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/workers", adminWorkerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/workers/analytics", workerAnalyticsRoutes);
app.use("/api/workers/support", workerSupportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authLimiter, authRoutes); // Apply stricter rate limiting to auth
app.use("/api/wallet", userwalletRoutes);
app.use("/api/worker-wallet", workerWalletRoutes);
app.use("/api/payment", paymentConfigRoutes); // Must be before paymentRoutes - /api/payment/config (public)
app.use("/api/payment", paymentRoutes); // /api/payment/order, /api/payment/verify (protected)
app.use("/api/support", supportRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/coins", coinsRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/home-tips", homeTipRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/membership-plans", membershipRoutes);
app.use("/api/amc-plans", amcRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/marriage-event-packages", marriageEventPackageRoutes);
app.use("/api/marriage-event-bookings", marriageEventBookingRoutes);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Test API
app.get("/", (req, res) => {
  res.send("Backend API is running successfully");
});

// Not Found Handler
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// Database Connect with connection pooling
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/RanX24";

mongoose
  .connect(MONGO_URI, {
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4 to resolve SRV issues
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Create Server + Socket.IO Support
import { Server } from "socket.io";
import http from "http";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5174",
      "http://localhost:19006",
      "https://www.ranx24.com",
      "https://ranx24.com",
      "https://backend.ranx24.com",
      ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
    ],
    credentials: true
  },
});

// Socket middleware to access req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_room", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    }
  });

  // Handle join_notifications (used by worker app)
  socket.on("join_notifications", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined notifications for ${userId}`);
    }
  });

  // Handle chat events
  socket.on("join_chat", (chatId) => {
    if (chatId) {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat ${chatId}`);
    }
  });

  socket.on("leave_chat", (chatId) => {
    if (chatId) {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat ${chatId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

console.log('Attempting to start server on port:', PORT);
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);



server.on('error', (e) => {
  console.error('Server Error:', e);
});
