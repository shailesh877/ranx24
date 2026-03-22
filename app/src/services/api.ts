import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import config from '../config/config';

const api = axios.create({
    baseURL: config.API_URL,
    timeout: config.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Debug: Log the API URL being used
console.log('🌐 API Configuration:', {
    baseURL: config.API_URL,
    platform: Platform.OS,
    timeout: config.TIMEOUT
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
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Ensure boolean values are properly sent (not as strings)
        if (config.data && typeof config.data === 'object') {
            config.data = ensureBooleans(config.data);
        }

        // Debug: Log API calls
        console.log('📡 API Request:', config.method?.toUpperCase(), config.url);

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Logout handler to be set by AuthContext
let logoutHandler: (() => void) | null = null;

export const setLogoutHandler = (handler: () => void) => {
    logoutHandler = handler;
};

// Response interceptor for error handling and retry logic
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            // Don't auto-logout for certain endpoints that might be optional or checked in background
            const isOptionalEndpoint = originalRequest.url?.includes('/wallet/') ||
                originalRequest.url?.includes('/coins/config') ||
                originalRequest.url?.includes('/admin/fees'); // Fee config is optional for checkout

            if (!isOptionalEndpoint) {
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');

                // Trigger logout in AuthContext
                if (logoutHandler) {
                    logoutHandler();
                }
            }
        }

        // Retry logic for network errors
        if (
            !originalRequest._retry &&
            error.message === 'Network Error' &&
            originalRequest._retryCount < config.RETRY_ATTEMPTS
        ) {
            originalRequest._retry = true;
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

            // Exponential backoff: wait 1s, 2s, 4s...
            const delay = Math.pow(2, originalRequest._retryCount - 1) * 1000;

            console.log(`🔄 Retrying request (attempt ${originalRequest._retryCount}/${config.RETRY_ATTEMPTS})...`);

            await new Promise(resolve => setTimeout(resolve, delay));

            return api(originalRequest);
        } else if (error.message === 'Network Error') {
            console.error('❌ Network Error Details:', {
                message: error.message,
                baseURL: config.API_URL,
                url: originalRequest.url,
                method: originalRequest.method,
                headers: originalRequest.headers
            });
        }

        return Promise.reject(error);
    }
);

export default api;
export const API_URL = config.API_URL;
