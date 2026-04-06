import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import socketService from '../services/socketService';
import Toast from 'react-native-toast-message';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// User Screens
import HomeScreen from '../screens/user/HomeScreen';
import CategoriesScreen from '../screens/user/CategoriesScreen';
import BookingScreen from '../screens/user/BookingScreen';
import CartScreen from '../screens/user/CartScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import MyBookingsScreen from '../screens/user/MyBookingsScreen';
import CheckoutScreen from '../screens/user/CheckoutScreen';
import OrderSuccessScreen from '../screens/user/OrderSuccessScreen';
import EditProfileScreen from '../screens/user/EditProfileScreen';
import MyAddressesScreen from '../screens/user/MyAddressesScreen';
import WalletScreen from '../screens/user/WalletScreen';
import HelpScreen from '../screens/user/HelpScreen';
import SettingsScreen from '../screens/user/SettingsScreen';
import AddAddressScreen from '../screens/user/AddAddressScreen';
import BookingDetailScreen from '../screens/user/BookingDetailScreen';
import NotificationsScreen from '../screens/user/NotificationsScreen';
import ChatScreen from '../screens/user/ChatScreen';
import SupportChatScreen from '../screens/user/SupportChatScreen';
import ChatListScreen from '../screens/user/ChatListScreen';
import MapScreen from '../screens/user/MapScreen';
import CategoryDetailScreen from '../screens/user/CategoryDetailScreen';
import SubCategoryScreen from '../screens/user/SubCategoryScreen';
import PrivacyPolicyScreen from '../screens/user/PrivacyPolicyScreen';
import AboutScreen from '../screens/user/AboutScreen';
import TermsScreen from '../screens/user/TermsScreen';
import FAQScreen from '../screens/user/FAQScreen';
import MembershipScreen from '../screens/user/MembershipScreen';
import AMCScreen from '../screens/user/AMCScreen';
import QRScannerScreen from '../screens/user/QRScannerScreen';
import VerifyWorkerScreen from '../screens/user/VerifyWorkerScreen';

// Worker Screens
import WorkerDashboardScreen from '../screens/worker/WorkerDashboardScreen';
import WorkerBookingDetailScreen from '../screens/worker/WorkerBookingDetailScreen';
import WorkerProfileScreen from '../screens/user/WorkerProfileScreen';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for User
const UserTabNavigator = () => {
    const { colors, isDark } = useTheme();

    return (
        <Tab.Navigator
            id={undefined}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Categories') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Wallet') {
                        iconName = focused ? 'wallet' : 'wallet-outline';
                    } else if (route.name === 'MyBookings') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Categories" component={CategoriesScreen} />
            <Tab.Screen name="Wallet" component={WalletScreen} />
            <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'Bookings' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
    const { isAuthenticated, loading, user } = useAuth();
    const { isDark } = useTheme();

    const navigationTheme = isDark ? DarkTheme : DefaultTheme;

    useEffect(() => {
        if (isAuthenticated && user) {
            socketService.connect();
            if (user.role === 'worker') {
                socketService.joinWorkerRoom(user._id);
            } else {
                socketService.joinUserRoom(user._id);
            }
        }

        return () => {
            socketService.disconnect();
        };
    }, [isAuthenticated, user]);

    if (loading) {
        return null; // Or a loading screen
    }

    return (
        <NavigationContainer theme={navigationTheme} ref={navigationRef}>
            <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                ) : user?.role === 'worker' ? (
                    // Worker Stack
                    <>
                        <Stack.Screen name="WorkerDashboard" component={WorkerDashboardScreen} />
                        <Stack.Screen name="WorkerBookingDetail" component={WorkerBookingDetailScreen} />
                    </>
                ) : (
                    // User Stack
                    <>
                        <Stack.Screen name="Main" component={UserTabNavigator} />
                        <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
                        <Stack.Screen name="SubCategory" component={SubCategoryScreen} />
                        <Stack.Screen name="Cart" component={CartScreen} />
                        <Stack.Screen name="Booking" component={BookingScreen} />
                        <Stack.Screen name="Checkout" component={CheckoutScreen} />
                        <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="MyAddresses" component={MyAddressesScreen} />
                        <Stack.Screen name="Wallet" component={WalletScreen} />
                        <Stack.Screen name="Help" component={HelpScreen} />
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                        <Stack.Screen name="AddAddress" component={AddAddressScreen} />
                        <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} />
                        <Stack.Screen name="Chat" component={ChatScreen} />
                        <Stack.Screen name="SupportChat" component={SupportChatScreen} />
                        <Stack.Screen name="WorkerProfile" component={WorkerProfileScreen} />
                        <Stack.Screen name="ChatList" component={ChatListScreen} />

                        <Stack.Screen name="Map" component={MapScreen} />
                        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                        <Stack.Screen name="About" component={AboutScreen} />
                        <Stack.Screen name="Terms" component={TermsScreen} />
                        <Stack.Screen name="FAQ" component={FAQScreen} />
                        <Stack.Screen name="Membership" component={MembershipScreen} />
                        <Stack.Screen name="AMC" component={AMCScreen} />
                        
                        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
                        <Stack.Screen name="VerifyWorker" component={VerifyWorkerScreen} />
                    </>
                )}
            </Stack.Navigator>
            <Toast />
        </NavigationContainer>
    );
};

export default AppNavigator;
