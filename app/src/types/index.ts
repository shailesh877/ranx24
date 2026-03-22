// Common types used across the app

export interface User {
    _id: string;
    name?: string;
    phone: string;
    email?: string;
    role?: 'user' | 'worker' | 'admin';
    userType?: string;
    profilePic?: string;
}

export interface Worker {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    services: string[];
    categories: string[];
    price?: number;
    averageRating?: number;
    totalReviews?: number;
    distance?: number;
    profilePic?: string;
    location?: {
        type: string;
        coordinates: [number, number];
    };
}

export interface Category {
    _id: string;
    name: string;
    image?: string;
    subCategories?: SubCategory[];
}

export interface SubCategory {
    _id: string;
    name: string;
    description?: string;
}

export interface CartItem {
    _id: string;
    workerId?: string;
    workerName?: string;
    serviceId?: string;
    serviceName?: string;
    service: string;
    category: string;
    price: number;
    bookingType?: 'full-day' | 'half-day' | 'multiple-days';
    days?: number;
    startDate?: string;
    endDate?: string;
    bookingDate?: string;
    bookingTime?: string;
    image?: string;
    quantity?: number;
}

export interface Booking {
    _id: string;
    userId: string;
    workerId: string;
    workerName?: string;
    service: string;
    category?: string;
    bookingDate: string;
    bookingType: 'full-day' | 'half-day';
    days: number;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
    address?: string;
    phone?: string;
    notes?: string;
    paymentMethod?: 'cod' | 'online';
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (userData: User, authToken: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updatedUserData: Partial<User>) => Promise<void>;
}

export interface CartContextType {
    cartItems: CartItem[];
    loading: boolean;
    addToCart: (item: Omit<CartItem, '_id'>) => Promise<any>;
    removeFromCart: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

export type NavigationParams = {
    // Auth Screens
    Login: undefined;
    Register: { phone?: string };

    // Main Tab Navigator
    Main: undefined;

    // Tab Screens
    Home: undefined;
    Categories: { categoryId?: string };
    Cart: undefined;
    Bookings: undefined;
    Profile: undefined;
    ChatList: undefined;
    Chats: undefined;

    // Worker
    WorkerDashboard: undefined;

    // User Screens
    Booking: {
        categoryId?: string;
        categoryName?: string;
        subCategoryId: string;
        subCategoryName: string;
    };
    Checkout: undefined;
    OrderSuccess: { bookingId: string };
    EditProfile: undefined;
    MyAddresses: undefined;
    AddAddress: undefined;
    BookingDetail: { bookingId: string };
    Wallet: undefined;
    Help: undefined;
    Settings: undefined;
    Notifications: undefined;
    Chat: { bookingId: string; workerName?: string; workerId?: string };
    SupportChat: undefined;
};

export interface Chat {
    _id: string;
    bookingId: string;
    serviceName: string;
    otherPerson: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}
