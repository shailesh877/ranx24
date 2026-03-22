import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

import { API_URL } from './api';

const SOCKET_URL = API_URL.replace('/api', '');

class SocketService {
    socket: Socket | null = null;
    connected: boolean = false;

    async connect(): Promise<void> {
        if (this.socket?.connected) {
            console.log('⚠️ Socket already connected');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('workerToken');

            if (!token) {
                console.log('No token found, cannot connect to socket');
                return;
            }

            console.log('🔌 Connecting to Socket URL:', SOCKET_URL);

            this.socket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
                timeout: 10000,
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket connected:', this.socket?.id);
                this.connected = true;
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
                this.connected = false;
            });

            this.socket.on('connect_error', (error: Error) => {
                console.error('Socket connection error:', error.message);
            });

        } catch (error) {
            console.error('Error connecting to socket:', error);
        }
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    joinChat(chatId: string): void {
        if (this.socket && this.connected) {
            this.socket.emit('join_chat', chatId);
            console.log('Joined chat:', chatId);
        }
    }

    leaveChat(chatId: string): void {
        if (this.socket && this.connected) {
            this.socket.emit('leave_chat', chatId);
            console.log('Left chat:', chatId);
        }
    }

    sendMessage(chatId: string, message: any): void {
        if (this.socket && this.connected) {
            this.socket.emit('send_message', { chatId, message });
        }
    }

    onNewMessage(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('new_message', callback);
        }
    }

    onTyping(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('user_typing', callback);
        }
    }

    sendTyping(chatId: string, isTyping: boolean): void {
        if (this.socket && this.connected) {
            this.socket.emit('typing', { chatId, isTyping });
        }
    }

    removeListener(event: string): void {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    removeAllListeners(): void {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }
    // Join notification room
    joinNotifications(userId: string): void {
        if (this.socket && this.connected) {
            this.socket.emit('join_notifications', userId);
            console.log('Joined notifications for:', userId);
        }
    }

    // Listen for new notifications
    onNewNotification(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('new_notification', callback);
        }
    }

    // Listen for new bookings
    onNewBooking(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('new_booking', (data) => {
                console.log('🔔 Socket received new_booking event:', data);
                callback(data);
            });
        }
    }

    // Listen for booking removal (re-assignment)
    onBookingRemoved(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('booking_removed', (data) => {
                console.log('🔔 Socket received booking_removed event:', data);
                callback(data);
            });
        }
    }
}

export default new SocketService();
