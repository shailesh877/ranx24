import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        return Platform.OS === 'android'
            ? "https://backend.ranx24.com/api"
            : "https://backend.ranx24.com/api";
    }

    // Production fallback
    console.warn('⚠️ No API URL configured! Using default.');
    return "https://backend.ranx24.com/api";
};

const API_URL = getApiUrl();

console.log('API Configuration:', { API_URL });


const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper function to ensure boolean values are not strings
function ensureBooleans(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => ensureBooleans(item));
    }

    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];

                // Convert string booleans to actual booleans
                if (value === 'true') {
                    result[key] = true;
                } else if (value === 'false') {
                    result[key] = false;
                } else if (typeof value === 'object') {
                    result[key] = ensureBooleans(value);
                } else {
                    result[key] = value;
                }
            }
        }
        return result;
    }

    return obj;
}

// Request interceptor to add token and ensure booleans
api.interceptors.request.use(
    async (config) => {
        console.log('Making API request:', {
            url: config.url,
            baseURL: config.baseURL,
            method: config.method,
            data: config.data
        });

        const token = await AsyncStorage.getItem('workerToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Ensure boolean values are properly sent (not as strings)
        if (config.data && typeof config.data === 'object') {
            config.data = ensureBooleans(config.data);
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = await AsyncStorage.getItem('refreshToken');

                if (refreshToken) {
                    const response = await axios.post(`${API_URL.replace('/api', '')}/api/auth/refresh-token`, {
                        refreshToken
                    });

                    const { token } = response.data;
                    await AsyncStorage.setItem('workerToken', token);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                } else {
                    // No refresh token, logout user
                    await AsyncStorage.removeItem('workerToken');
                    await AsyncStorage.removeItem('worker');
                    await AsyncStorage.removeItem('refreshToken');
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                await AsyncStorage.removeItem('workerToken');
                await AsyncStorage.removeItem('worker');
                await AsyncStorage.removeItem('refreshToken');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
export { API_URL };
