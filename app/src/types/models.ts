// User Models
export interface User {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
}

// Category Models
export interface SubCategory {
    _id: string;
    name: string;
    description?: string;
}

export interface Category {
    _id: string;
    name: string;
    image: string;
    description?: string;
    subCategories: SubCategory[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Worker Models
export interface WorkerService {
    category: {
        _id: string;
        name: string;
    };
    subcategory: string;
    price: number;
    isActive: boolean;
}

export interface Worker {
    _id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    profileImage?: string;
    services: WorkerService[];
    rating: number;
    reviewCount: number;
    totalBookings: number;
    completedBookings: number;
    city: string;
    state: string;
    isAvailable: boolean;
    status: 'pending' | 'approved' | 'rejected' | 'unavailable';
    createdAt: string;
    updatedAt: string;
}

// Booking Models
export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string;
}

export interface Booking {
    _id: string;
    user: User;
    worker: Worker;
    service: {
        _id: string;
        name: string;
        category: string;
    };
    scheduledDate: string;
    scheduledTime: string;
    address: Address;
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
    price: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    paymentMethod?: string;
    coinsUsed?: number;
    couponCode?: string;
    discount?: number;
    finalPrice: number;
    createdAt: string;
    updatedAt: string;
}

// Banner Models
export interface Banner {
    _id: string;
    title: string;
    image: string;
    link?: string;
    isActive: boolean;
    position: 'home' | 'category' | 'checkout';
    createdAt: string;
    updatedAt: string;
}

// Cart Models
export interface CartItem {
    _id: string;
    worker: Worker;
    service: {
        category: string;
        subcategory: string;
        price: number;
    };
    scheduledDate?: string;
    scheduledTime?: string;
    address?: Address;
    quantity?: number;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
}

// Wallet Models
export interface WalletTransaction {
    _id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    createdAt: string;
}

export interface Wallet {
    _id: string;
    user: string;
    balance: number;
    ycCoins: number;
    transactions: WalletTransaction[];
}

// Notification Models
export interface Notification {
    _id: string;
    user: string;
    title: string;
    message: string;
    type: 'booking' | 'payment' | 'system' | 'promotion';
    isRead: boolean;
    data?: Record<string, unknown>;
    createdAt: string;
}

// Review Models
export interface Review {
    _id: string;
    user: User;
    worker: string;
    booking: string;
    rating: number;
    comment?: string;
    createdAt: string;
    updatedAt: string;
}
