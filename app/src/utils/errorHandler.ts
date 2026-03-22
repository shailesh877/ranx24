import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';

export interface ErrorDetails {
    message: string;
    code?: string;
    statusCode?: number;
}

/**
 * Extract error details from various error types
 */
export const getErrorDetails = (error: unknown): ErrorDetails => {
    // Axios error
    if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message || error.message;

        return {
            message,
            code: error.code,
            statusCode,
        };
    }

    // Standard Error
    if (error instanceof Error) {
        return {
            message: error.message,
        };
    }

    // String error
    if (typeof error === 'string') {
        return {
            message: error,
        };
    }

    // Unknown error
    return {
        message: 'An unexpected error occurred',
    };
};

/**
 * Show error toast message
 */
export const showErrorToast = (error: unknown, title: string = 'Error') => {
    const { message } = getErrorDetails(error);

    Toast.show({
        type: 'error',
        text1: title,
        text2: message,
        position: 'top',
        visibilityTime: 4000,
    });
};

/**
 * Show success toast message
 */
export const showSuccessToast = (message: string, title: string = 'Success') => {
    Toast.show({
        type: 'success',
        text1: title,
        text2: message,
        position: 'top',
        visibilityTime: 3000,
    });
};

/**
 * Get user-friendly error message based on status code
 */
export const getUserFriendlyMessage = (statusCode?: number): string => {
    switch (statusCode) {
        case 400:
            return 'Invalid request. Please check your input.';
        case 401:
            return 'Please log in to continue.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 404:
            return 'The requested resource was not found.';
        case 429:
            return 'Too many requests. Please try again later.';
        case 500:
            return 'Server error. Please try again later.';
        case 503:
            return 'Service temporarily unavailable. Please try again later.';
        default:
            return 'Something went wrong. Please try again.';
    }
};

/**
 * Handle API errors with automatic toast
 */
export const handleApiError = (error: unknown, customMessage?: string) => {
    const { message, statusCode } = getErrorDetails(error);
    const displayMessage = customMessage || getUserFriendlyMessage(statusCode) || message;

    showErrorToast(displayMessage);

    // Log error for debugging
    console.error('API Error:', { message, statusCode, error });
};
