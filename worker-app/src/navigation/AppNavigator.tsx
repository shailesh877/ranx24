import React, { useEffect } from 'react';
import { NavigationContainer, LinkingOptions, createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import socketService from '../services/socketService';
import Toast from 'react-native-toast-message';
import { BookingAlertProvider } from '../context/BookingAlertProvider';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PrivacyPolicyScreen from '../screens/auth/PrivacyPolicyScreen';
import AboutScreen from '../screens/auth/AboutScreen';
import TermsScreen from '../screens/auth/TermsScreen';

// Worker Screens
import DashboardScreen from '../screens/worker/DashboardScreen';
import ProfileScreen from '../screens/worker/ProfileScreen';
import BookingDetailsScreen from '../screens/worker/BookingDetailsScreen';
import ChatScreen from '../screens/worker/ChatScreen';
import ChatListScreen from '../screens/worker/ChatListScreen';
import WalletScreen from '../screens/worker/WalletScreen';
import EarningsAnalyticsScreen from '../screens/worker/EarningsAnalyticsScreen';
import SupportScreen from '../screens/worker/SupportScreen';
import PendingBookingsScreen from '../screens/worker/PendingBookingsScreen';
import ActiveBookingsScreen from '../screens/worker/ActiveBookingsScreen';
import NotificationsScreen from '../screens/worker/NotificationsScreen';

const Stack = createStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ['ranx24-worker://', 'https://worker.ranx24.com'],
    config: {
        screens: {
            Dashboard: 'dashboard',
            BookingDetails: 'booking/:bookingId',
            Notifications: 'notifications',
            Chat: 'chat/:bookingId',
            Profile: 'profile',
            Wallet: 'wallet',
            PendingBookings: 'pending-bookings',
        },
    },
};

const AppNavigator: React.FC = () => {
    const { isAuthenticated, loading, worker } = useAuth();

    useEffect(() => {
        if (isAuthenticated && worker) {
            // Connect to socket
            socketService.connect();

            // Join notification room
            setTimeout(() => {
                if (worker?._id) {
                    console.log('🔔 Joining notification room for worker:', worker._id);
                    socketService.joinNotifications(worker._id);
                } else {
                    console.error('❌ Cannot join notifications: Worker ID missing');
                }
            }, 1000);

            // Listen for notifications
            socketService.onNewNotification((data) => {
                Toast.show({
                    type: 'success',
                    text1: data.title,
                    text2: data.message,
                    visibilityTime: 4000,
                });
            });

            return () => {
                socketService.removeListener('new_notification');
                socketService.disconnect();
            };
        }
    }, [isAuthenticated, worker]);

    if (loading) {
        return null; // Or a loading screen
    }

    return (
        <NavigationContainer linking={linking} ref={navigationRef}>
            <BookingAlertProvider>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {!isAuthenticated ? (
                        // Auth Stack
                        <>
                            <Stack.Screen name="Login" component={LoginScreen} />
                            <Stack.Screen name="Register" component={RegisterScreen} />
                            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                            <Stack.Screen name="About" component={AboutScreen} />
                            <Stack.Screen name="Terms" component={TermsScreen} />
                        </>
                    ) : (
                        // Worker Stack
                        <>
                            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="EarningsAnalytics" component={EarningsAnalyticsScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="PendingBookings" component={PendingBookingsScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ActiveBookings" component={ActiveBookingsScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
                        </>
                    )}
                </Stack.Navigator>
            </BookingAlertProvider>
            <Toast />
        </NavigationContainer>
    );
};

export default AppNavigator;
