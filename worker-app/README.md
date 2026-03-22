# Worker App

A dedicated mobile application for workers built with React Native (Expo) and TypeScript.

## Features

- **Authentication**: OTP-based login for workers
- **Worker Registration**: Complete registration flow with document upload
- **Dashboard**: View bookings, stats, and earnings
- **Profile Management**: View and edit worker profile
- **Real-time Updates**: Stay updated with booking notifications

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Update the API URL in `src/services/api.ts`:
```typescript
export const API_URL = 'http://YOUR_IP:5000/api';
```

For Android Emulator, use:
- `http://10.0.2.2:5000/api` (for localhost)
- `http://YOUR_LOCAL_IP:5000/api` (for physical device)

## Running the App

### Start the development server:
```bash
npm start
```

### Run on Android:
```bash
npm run android
```

### Run on iOS:
```bash
npm run ios
```

## Project Structure

```
worker-app/
├── src/
│   ├── context/          # React Context (Auth)
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   │   ├── auth/         # Login, Register
│   │   └── worker/       # Dashboard, Profile
│   ├── services/         # API service
│   └── types/            # TypeScript types
├── App.tsx               # Main app component
└── package.json
```

## Backend Integration

This app connects to the same backend as the user app. Make sure the backend server is running:

```bash
cd ../backend
npm start
```

The backend should be running on `http://localhost:5000`.

## Key Screens

### 1. Login Screen
- OTP-based authentication
- Mobile number verification

### 2. Registration Screen
- Personal information
- Address details
- Document upload (Aadhaar, PAN, Live Photo)

### 3. Dashboard
- Booking statistics
- Recent bookings
- Earnings overview

### 4. Profile
- View worker details
- Service information
- Performance metrics

## API Endpoints Used

- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/workers/mobile/:mobileNumber` - Get worker by mobile
- `POST /api/workers/register` - Register new worker
- `GET /api/workers/:id/stats` - Get worker statistics
- `GET /api/bookings?worker=:id` - Get worker bookings

## Notes

- Workers must be approved by admin before they can start receiving bookings
- The app uses the same database as the user app
- All worker data is stored in the `workers` collection in MongoDB

## Troubleshooting

### Network Error
If you get a network error, make sure:
1. Backend server is running
2. API_URL is correctly set to your machine's IP
3. Your device/emulator can reach the backend server

### Image Upload Issues
Make sure you have the necessary permissions:
- Camera permission for live photo
- Storage permission for document upload
