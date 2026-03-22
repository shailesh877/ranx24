import axios from 'axios';
import config from '../config/config';

let cachedRazorpayKey: string | null = null;

/**
 * Fetch Razorpay Key ID from backend
 * This ensures we always use the correct key (test/production)
 * based on backend environment
 */
export const getRazorpayKey = async (): Promise<string> => {
    // Return cached key if available
    if (cachedRazorpayKey) {
        return cachedRazorpayKey;
    }

    try {
        const response = await axios.get(`${config.API_URL}/payment/config`, {
            timeout: 5000
        });

        if (response.data?.razorpayKeyId) {
            cachedRazorpayKey = response.data.razorpayKeyId;
            console.log('✅ Razorpay key fetched from backend');
            return cachedRazorpayKey;
        }

        throw new Error('Razorpay key not found in response');
    } catch (error) {
        console.error('❌ Failed to fetch Razorpay key from backend:', error);
        throw new Error('Unable to initialize payment gateway. Please try again.');
    }
};

/**
 * Clear cached Razorpay key (useful for testing or environment switches)
 */
export const clearRazorpayKeyCache = () => {
    cachedRazorpayKey = null;
};
