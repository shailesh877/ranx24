import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get API URL from environment or use development default
const getApiUrl = () => {
    // Check for environment variable first (production)
    const envApiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (envApiUrl) {
        return envApiUrl;
    }

    // Development fallback
    if (__DEV__) {
        // Use local network IP for mobile development
        return 'http://192.168.31.124:5000/api';
    }

    // Production fallback (should not reach here if env vars are set)
    console.warn('⚠️ No API URL configured! Using default.');
    return 'https://backend.ranx24.com/api';
};

// Configuration for different environments
const config = {
    API_URL: getApiUrl(),
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3
};

// Razorpay Key - MUST be fetched from backend API
// DO NOT hardcode production keys here for security
export const RAZORPAY_KEY_ID = ''; // Will be fetched from /api/payment/config

export default config;

// Helper function to get local network IP (for development)
export const getLocalNetworkIP = () => {
    return config.API_URL.replace('/api', '').replace('http://', '');
};
