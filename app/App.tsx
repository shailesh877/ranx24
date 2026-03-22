import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { LocationProvider } from './src/context/LocationContext';
import ErrorBoundary from './src/components/ErrorBoundary';

import { usePushNotifications } from './src/hooks/usePushNotifications';

const NotificationHandler = () => {
  const { expoPushToken } = usePushNotifications();
  console.log('Push Token in App:', expoPushToken);
  return null;
};

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider>
        <AuthProvider>
          <NotificationHandler />
          <ThemeProvider>
            <LocationProvider>
              <CartProvider>
                <AppNavigator />
                <StatusBar style="auto" />
                <Toast />
              </CartProvider>
            </LocationProvider>
          </ThemeProvider>
        </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}
