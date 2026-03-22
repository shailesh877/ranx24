import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

const SOCKET_URL = 'https://backend.ranx24.com';

class SocketService {
    socket = null;
    connected = false;

    async connect() {
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                console.log('No token found, cannot connect to socket');
                return;
            }

            this.socket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
                timeout: 10000,
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket connected:', this.socket.id);
                this.connected = true;
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
                this.connected = false;
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                // Don't spam errors, just log once
            });

        } catch (error) {
            console.error('Error connecting to socket:', error);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    // Join a chat room
    joinChat(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('join_chat', chatId);
            console.log('Joined chat:', chatId);
        }
    }

    // Leave a chat room
    leaveChat(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('leave_chat', chatId);
            console.log('Left chat:', chatId);
        }
    }

    // Send a message
    sendMessage(chatId, message) {
        if (this.socket && this.connected) {
            this.socket.emit('send_message', { chatId, message });
        }
    }

    // Listen for new messages
    onNewMessage(callback) {
        if (this.socket) {
            this.socket.on('new_message', callback);
        }
    }

    // Listen for typing indicator
    onTyping(callback) {
        if (this.socket) {
            this.socket.on('user_typing', callback);
        }
    }

    // Send typing indicator
    sendTyping(chatId, isTyping) {
        if (this.socket && this.connected) {
            this.socket.emit('typing', { chatId, isTyping });
        }
    }

    // Remove listeners
    removeListener(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    // Remove all listeners
    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }
    // Join notification room
    joinNotifications(userId) {
        if (this.socket && this.connected) {
            this.socket.emit('join_notifications', userId);
            console.log('Joined notifications for:', userId);
        }
    }

    // Join user room
    joinUserRoom(userId) {
        if (this.socket && this.connected) {
            this.socket.emit('join_room', userId);
            console.log('Joined user room:', userId);
        }
    }

    // Join worker room
    joinWorkerRoom(workerId) {
        if (this.socket && this.connected) {
            this.socket.emit('join_room', workerId);
            console.log('Joined worker room:', workerId);
        }
    }

    // Listen for new notifications
    onNewNotification(callback) {
        if (this.socket) {
            this.socket.on('new_notification', callback);
        }
    }
}

export default new SocketService();
