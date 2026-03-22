import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from '../services/api';
import { navigationRef } from '../navigation/AppNavigator';

Notifications.setNotificationHandler({
    handleNotification: async () => ({

        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    // if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }

    try {
        // We need the raw FCM token for the backend's Firebase Admin SDK
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        token = deviceToken.data;
        console.log('FCM Token:', token);
    } catch (e) {
        console.log('Error getting token:', e);
    }
    // } else {
    //     console.log('Must use physical device for Push Notifications');
    // }

    return token;
}

import { useAuth } from '../context/AuthContext';

export const usePushNotifications = () => {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token);
            if (token && isAuthenticated) {
                api.put('/notifications/fcm-token', { fcmToken: token })
                    .then(() => console.log('FCM Token synced with backend'))
                    .catch(err => console.error('Failed to sync FCM token:', err));
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification tapped:', response);

            if (!isAuthenticated) {
                console.log('User not authenticated, ignoring notification navigation');
                return;
            }

            const data = response.notification.request.content.data;

            if (data?.screen && navigationRef.isReady()) {
                let params = data.params;
                try {
                    if (typeof params === 'string') {
                        params = JSON.parse(params);
                    }
                } catch (e) {
                    console.error('Error parsing notification params:', e);
                }
                // @ts-ignore
                navigationRef.navigate(data.screen, params);
            } else if (navigationRef.isReady()) {
                // Default to Notifications screen if no specific screen is provided
                // @ts-ignore
                navigationRef.navigate('Notifications');
            }
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [isAuthenticated]);

    return {
        expoPushToken,
        notification,
    };
};
