import { Pusher } from '@pusher/pusher-websocket-react-native';
import { Platform } from 'react-native';

// Initialize Pusher
// Replace with your actual credentials from .env or config
const PUSHER_APP_KEY = 'YOUR_PUSHER_KEY';
const PUSHER_CLUSTER = 'YOUR_PUSHER_CLUSTER';

let pusher: Pusher | null = null;

export const initPusher = async () => {
    if (pusher) return pusher;

    pusher = Pusher.getInstance();

    try {
        await pusher.init({
            apiKey: PUSHER_APP_KEY,
            cluster: PUSHER_CLUSTER,
        });

        await pusher.connect();
        console.log('Pusher connected');
    } catch (e) {
        console.log(`ERROR: ${e}`);
    }

    return pusher;
};

export const subscribeToNotifications = async (userId: string, userType: string, onNotification: (data: any) => void) => {
    if (!pusher) {
        await initPusher();
    }

    if (!pusher) return;

    const channelName = `${userType.toLowerCase()}-${userId}`;

    try {
        await pusher.subscribe({
            channelName,
            onEvent: (event: any) => {
                if (event.eventName === 'notification') {
                    console.log(`Event received: ${event}`);
                    const data = JSON.parse(event.data);
                    onNotification(data);
                }
            }
        });
        console.log(`Subscribed to ${channelName}`);
    } catch (e) {
        console.log(`ERROR: ${e}`);
    }
};

export const unsubscribeFromNotifications = async (userId: string, userType: string) => {
    if (!pusher) return;

    const channelName = `${userType.toLowerCase()}-${userId}`;
    try {
        await pusher.unsubscribe({ channelName });
        console.log(`Unsubscribed from ${channelName}`);
    } catch (e) {
        console.log(`ERROR: ${e}`);
    }
};
