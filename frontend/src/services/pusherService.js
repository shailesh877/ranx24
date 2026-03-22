import Pusher from 'pusher-js';

// Initialize Pusher
// Replace with your actual credentials from .env
const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY || 'YOUR_PUSHER_KEY', {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'YOUR_PUSHER_CLUSTER',
    encrypted: true
});

export const subscribeToNotifications = (userId, userType, onNotification) => {
    if (!userId) return;

    const channelName = `${userType.toLowerCase()}-${userId}`;
    const channel = pusher.subscribe(channelName);

    console.log(`Subscribed to Pusher channel: ${channelName}`);

    channel.bind('notification', (data) => {
        console.log('Received Pusher notification:', data);
        if (onNotification) {
            onNotification(data);
        }
    });

    return channel;
};

export const unsubscribeFromNotifications = (userId, userType) => {
    if (!userId) return;

    const channelName = `${userType.toLowerCase()}-${userId}`;
    pusher.unsubscribe(channelName);
    console.log(`Unsubscribed from Pusher channel: ${channelName}`);
};

export default pusher;
