import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// Root Stack Navigator
export type RootStackParamList = {
    OTPLogin: undefined;
    Register: undefined;
    MainTabs: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
    Home: undefined;
    Categories: undefined;
    MyBookings: undefined;
    Cart: undefined;
    Profile: undefined;
};

// User Stack Navigator
export type UserStackParamList = {
    Home: undefined;
    Categories: undefined;
    Booking: {
        categoryId?: string;
        categoryName?: string;
        subCategoryName?: string;
        singleWorkerId?: string;
        serviceId?: string;
        serviceName?: string;
        basePrice?: number;
        mode?: 'service-booking';
    };
    CategoryDetail: {
        categoryId: string;
        categoryName: string;
    };
    BookingDetail: {
        bookingId: string;
    };
    Checkout: {
        directBooking?: any;
    } | undefined;
    OrderSuccess: {
        bookingId: string;
    };
    MyBookings: undefined;
    Cart: undefined;
    Profile: undefined;
    EditProfile: undefined;
    Wallet: undefined;
    MyAddresses: undefined;
    AddAddress: {
        addressId?: string;
    };
    Settings: undefined;
    Notifications: undefined;
    Help: undefined;
    SupportChat: {
        ticketId?: string;
    };
    ChatList: undefined;
    Chat: {
        chatId: string;
        recipientName: string;
    };
    Map: undefined;
};

// Navigation Props
export type HomeScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Home'>,
    StackNavigationProp<UserStackParamList>
>;

export type BookingScreenNavigationProp = StackNavigationProp<UserStackParamList, 'Booking'>;
export type BookingScreenRouteProp = RouteProp<UserStackParamList, 'Booking'>;

export type CheckoutScreenNavigationProp = StackNavigationProp<UserStackParamList, 'Checkout'>;

export type OTPLoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTPLogin'>;

export type ProfileScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Profile'>,
    StackNavigationProp<UserStackParamList>
>;

// Screen Props
export interface HomeScreenProps {
    navigation: HomeScreenNavigationProp;
}

export interface BookingScreenProps {
    navigation: BookingScreenNavigationProp;
    route: BookingScreenRouteProp;
}

export interface CheckoutScreenProps {
    navigation: CheckoutScreenNavigationProp;
}

export interface OTPLoginScreenProps {
    navigation: OTPLoginScreenNavigationProp;
}
