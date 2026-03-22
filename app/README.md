# RanX24 Mobile App

React Native mobile application for RanX24 home services platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (Download from Play Store/App Store)

### Installation

1. **Navigate to app directory:**
   ```bash
   cd app
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Update API URL:**
   - Open `src/services/api.js`
   - Replace `192.168.1.100` with your computer's local IP address
   - Find your IP:
     - Windows: `ipconfig` (look for IPv4 Address)
     - Mac/Linux: `ifconfig` or `ip addr`

4. **Start the backend server** (in a separate terminal):
   ```bash
   cd ../backend
   npm start
   ```

5. **Start the Expo development server:**
   ```bash
   npm start
   ```

6. **Run on your device:**
   - Scan the QR code with Expo Go app (Android)
   - Or scan with Camera app (iOS)

## 📱 Features Implemented

### ✅ Phase 1 (Completed)
- [x] Project setup with Expo
- [x] Authentication (OTP Login)
- [x] Home Screen with Categories
- [x] Cart Management
- [x] Profile Screen
- [x] Navigation (Tab + Stack)
- [x] Context Providers (Auth, Cart)
- [x] API Integration

### 🚧 Phase 2 (To Be Implemented)
- [ ] Categories & Subcategories Listing
- [ ] Worker Listing with Filters
- [ ] Location Services (GPS)
- [ ] Booking Creation
- [ ] My Bookings List
- [ ] Worker Dashboard
- [ ] Payments Integration
- [ ] Push Notifications

## 📁 Project Structure

```
app/
├── src/
│   ├── screens/          # All app screens
│   │   ├── auth/         # Login screens
│   │   ├── user/         # User screens
│   │   ├── worker/       # Worker screens
│   │   └── admin/        # Admin screens
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   ├── context/          # Context providers
│   ├── services/         # API services
│   └── utils/            # Utility functions
├── assets/               # Images, fonts
├── App.js                # Main app component
└── package.json
```

## 🔧 Configuration

### API Configuration
Edit `src/services/api.js`:
```javascript
const API_URL = 'http://YOUR_LOCAL_IP:5000/api';
```

### Test Credentials
- Phone: `1234567890`
- OTP: `123456`

## 📦 Dependencies

- **React Navigation**: Navigation library
- **Axios**: HTTP client
- **AsyncStorage**: Local storage
- **React Native Paper**: UI components
- **Socket.IO Client**: Real-time communication
- **React Native Toast**: Toast notifications

## 🎨 Design System

- **Primary Color**: #1E40AF (Blue)
- **Success Color**: #10B981 (Green)
- **Error Color**: #EF4444 (Red)
- **Background**: #F9FAFB (Light Gray)
- **Text**: #111827 (Dark Gray)

## 🐛 Troubleshooting

### Common Issues

1. **"Network Error" or "Cannot connect to backend"**
   - Make sure backend server is running
   - Check if API_URL in `src/services/api.js` has correct IP
   - Ensure phone and computer are on same WiFi network

2. **"Metro bundler not starting"**
   ```bash
   expo start --clear
   ```

3. **"Module not found"**
   ```bash
   npm install
   expo start --clear
   ```

## 📱 Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

## 🔜 Next Steps

1. Implement Categories & Subcategories screens
2. Add Worker Listing with filters
3. Integrate Maps for location
4. Add Booking flow
5. Implement Payment gateway
6. Add Push notifications
7. Complete Worker dashboard

## 📄 License

This project is part of RanX24 platform.
