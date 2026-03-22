import { Category, Worker, Booking, Banner, Cart, Wallet, Notification } from './models';

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        nextPage: number | null;
        prevPage: number | null;
    };
}

// Auth API
export interface SendOTPResponse {
    message: string;
    otp?: string; // Only in development
    expiresIn: number;
}

export interface VerifyOTPResponse {
    message: string;
    user: {
        _id: string;
        name: string;
        phone: string;
        email?: string;
    };
    token: string;
    userType: 'user' | 'worker' | 'admin';
}

// Categories API
export type GetCategoriesResponse = Category[];

// Workers API
export type GetWorkersResponse = PaginatedResponse<Worker>;

export interface GetWorkerResponse {
    success: boolean;
    data: Worker;
}

// Bookings API
export type GetBookingsResponse = PaginatedResponse<Booking>;

export interface CreateBookingRequest {
    workerId: string;
    serviceId: string;
    scheduledDate: string;
    scheduledTime: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        landmark?: string;
    };
    price: number;
    couponCode?: string;
    coinsUsed?: number;
}

export interface CreateBookingResponse {
    success: boolean;
    data: Booking;
    message: string;
}

// Banners API
export type GetBannersResponse = Banner[];

// Cart API
export interface GetCartResponse {
    success: boolean;
    data: Cart;
}

export interface AddToCartRequest {
    workerId: string;
    service: {
        category: string;
        subcategory: string;
        price: number;
    };
}

// Wallet API
export interface GetWalletResponse {
    success: boolean;
    data: Wallet;
}

// Payment API
export interface CreatePaymentOrderRequest {
    amount: number;
}

export interface CreatePaymentOrderResponse {
    id: string;
    amount: number;
    currency: string;
}

export interface VerifyPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

// Notifications API
export type GetNotificationsResponse = Notification[];

// Error Response
export interface ApiError {
    status: 'error';
    message: string;
    errors?: Record<string, string[]>;
}
