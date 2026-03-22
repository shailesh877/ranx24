import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

import { useAuth } from './AuthContext';

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            const serverUrl = import.meta.env.VITE_SERVER_URL || 'https://www.ranx24.com';
            console.log(`[Socket] Attempting to connect to ${serverUrl}`);
            const newSocket = io(serverUrl, {
                auth: { token },
                transports: ['polling', 'websocket'],
                withCredentials: true,
            });

            newSocket.on('connect', () => {
                console.log(`[Socket] Connected with ID: ${newSocket.id}`);
                if (user._id) {
                    console.log(`[Socket] Emitting 'join_room' for user ID: ${user._id}`);
                    newSocket.emit('join_room', user._id);
                }
                const userType = localStorage.getItem('userType');
                if (user.role === 'admin' || userType === 'admin') {
                    console.log("[Socket] Emitting 'join_room' for 'admin' room.");
                    newSocket.emit('join_room', 'admin');
                }
            });

            newSocket.on('connect_error', (err) => {
                console.error(`[Socket] Connection Error: ${err.message}`);
            });

            newSocket.on('disconnect', (reason) => {
                console.log(`[Socket] Disconnected: ${reason}`);
            });

            setSocket(newSocket);

            return () => {
                console.log('[Socket] Disconnecting socket due to cleanup or unmount.');
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                console.log('[Socket] Disconnecting existing socket due to missing user/token.');
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
