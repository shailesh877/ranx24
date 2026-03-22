# Production Deployment Guide

## 🚀 Quick Start

This guide covers deploying the Yello Capp MERN application to production.

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Setup

#### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/yellowcaps
JWT_SECRET=<64-character-random-string>
RAZORPAY_KEY_ID=rzp_live_XXXXXXXX
RAZORPAY_KEY_SECRET=<your-live-secret>
CLIENT_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

#### Frontend (.env.production)
```bash
VITE_API_URL=https://api.yourdomain.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXX
```

#### Mobile Apps
```bash
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 2. Security Checklist

- [x] Firebase `serviceAccountKey.json` removed from repo and added to `.gitignore`
- [x] All Razorpay keys rotated (using LIVE keys, not TEST)
- [x] JWT_SECRET is strong (64+ characters)
- [x] CORS configured to block unknown origins
- [x] Rate limiting enabled (100 req/15min)
- [x] Auth rate limiting enabled (5 req/15min)
- [x] Socket.IO CORS restricted
- [x] Request size limits added (10mb)
- [x] Database connection pooling configured
- [x] Health check endpoint added

### 3. Backend Deployment (Railway/Render)

1. **Connect Repository**
   - Link your GitHub repo to Railway/Render

2. **Set Environment Variables**
   - Add all variables from `.env.production.example`
   - Upload Firebase service account as secret

3. **Build Settings**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`

4. **Deploy**
   - Deploy and note your backend URL

### 4. Frontend Deployment (Vercel)

1. **Connect Repository**
   - Import project from GitHub

2. **Configure Build**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`

3. **Environment Variables**
   - `VITE_API_URL`: Your backend URL + `/api`
   - `VITE_RAZORPAY_KEY_ID`: Your live Razorpay key

4. **Deploy**

### 5. Mobile Apps Deployment

#### Android (Google Play Store)

1. **Update Environment**
   ```bash
   cd app  # or worker-app
   echo "EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api" > .env
   ```

2. **Clean Build**
   ```bash
   npx expo prebuild --clean
   cd android
   ./gradlew clean
   ./gradlew bundleRelease
   ```

3. **Upload to Play Store**
   - Upload `android/app/build/outputs/bundle/release/app-release.aab`
   - Ensure it's signed with release keystore

#### iOS (App Store)

1. **Configure Xcode**
   - Open `ios/` folder in Xcode
   - Set signing certificates

2. **Build**
   ```bash
   npx expo prebuild --clean
   cd ios
   xcodebuild -workspace YourApp.xcworkspace -scheme YourApp -configuration Release
   ```

3. **Upload to App Store Connect**

### 6. Database Setup (MongoDB Atlas)

1. **Create Production Cluster**
   - Choose M10+ tier for production
   - Enable automated backups

2. **Configure Network Access**
   - Whitelist your backend server IP
   - Or use `0.0.0.0/0` with strong authentication

3. **Update Connection String**
   - Use the Atlas connection string in `MONGO_URI`

### 7. Post-Deployment Verification

1. **Test Health Endpoint**
   ```bash
   curl https://api.yourdomain.com/health
   ```

2. **Test API**
   ```bash
   curl https://api.yourdomain.com/api/categories
   ```

3. **Test Frontend**
   - Visit your frontend URL
   - Test login flow
   - Test booking creation

4. **Test Mobile Apps**
   - Install from Play Store/App Store
   - Test all critical flows

### 8. Monitoring Setup (Recommended)

1. **Error Tracking**
   - Set up Sentry for backend and frontend
   - Add Sentry DSN to environment variables

2. **Uptime Monitoring**
   - Use UptimeRobot or similar
   - Monitor `/health` endpoint

3. **Database Monitoring**
   - Enable MongoDB Atlas monitoring
   - Set up alerts for high CPU/memory

## 🔒 Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Rotate keys regularly** - Especially after team changes
3. **Monitor logs** - Check for suspicious activity
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use HTTPS everywhere** - No HTTP in production

## 📞 Support

If you encounter issues:
1. Check backend logs
2. Check frontend console
3. Verify environment variables
4. Test API endpoints directly

## 🎯 Performance Tips

1. **Enable CDN** for frontend (Vercel/Cloudflare)
2. **Use Redis** for caching (optional)
3. **Enable compression** on backend
4. **Optimize images** before upload
5. **Monitor database queries** for slow operations

---

**Good luck with your deployment! 🚀**
