import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://www.ranx24.com/api',
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Razorpay configuration - fetch from backend for security
export const getRazorpayConfig = async () => {
    try {
        const response = await axiosInstance.get('/payment/config');
        return response.data.razorpayKeyId;
    } catch (error) {
        console.error('Failed to fetch Razorpay config:', error);
        throw new Error('Unable to initialize payment gateway');
    }
};

export default axiosInstance;
