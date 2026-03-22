import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

import { BookingAlertProvider } from './src/context/BookingAlertProvider';

import { usePushNotifications } from './src/hooks/usePushNotifications';

const NotificationHandler = () => {
  const { expoPushToken } = usePushNotifications();
  console.log('Push Token in App:', expoPushToken);
  return null;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationHandler />
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}

