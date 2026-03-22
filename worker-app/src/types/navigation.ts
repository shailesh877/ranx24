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
    Dashboard: undefined;
    ChatList: undefined;
    Wallet: undefined;
    Profile: undefined;
};

// Worker Stack Navigator
export type WorkerStackParamList = {
    Dashboard: undefined;
    BookingDetails: {
        bookingId: string;
    };
    ChatList: undefined;
    Chat: {
        chatId: string;
        recipientName: string;
    };
    Wallet: undefined;
    EarningsAnalytics: undefined;
    Profile: undefined;
    Support: undefined;
    PendingBookings: undefined;
    ActiveBookings: undefined;
    Notifications: undefined;
};

// Navigation Props
export type DashboardScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
    StackNavigationProp<WorkerStackParamList>
>;

export type BookingDetailsScreenNavigationProp = StackNavigationProp<WorkerStackParamList, 'BookingDetails'>;
export type BookingDetailsScreenRouteProp = RouteProp<WorkerStackParamList, 'BookingDetails'>;

export type ChatScreenNavigationProp = StackNavigationProp<WorkerStackParamList, 'Chat'>;
export type ChatScreenRouteProp = RouteProp<WorkerStackParamList, 'Chat'>;

export type ProfileScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Profile'>,
    StackNavigationProp<WorkerStackParamList>
>;

export type OTPLoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTPLogin'>;

// Screen Props
export interface DashboardScreenProps {
    navigation: DashboardScreenNavigationProp;
}

export interface BookingDetailsScreenProps {
    navigation: BookingDetailsScreenNavigationProp;
    route: BookingDetailsScreenRouteProp;
}

export interface ChatScreenProps {
    navigation: ChatScreenNavigationProp;
    route: ChatScreenRouteProp;
}

export interface ProfileScreenProps {
    navigation: ProfileScreenNavigationProp;
}

export interface OTPLoginScreenProps {
    navigation: OTPLoginScreenNavigationProp;
}
