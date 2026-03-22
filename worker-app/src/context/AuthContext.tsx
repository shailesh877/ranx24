import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Worker, AuthContextType } from '../types';
import socketService from '../services/socketService';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [worker, setWorker] = useState<Worker | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorker();
    }, []);

    const loadWorker = async () => {
        try {
            const storedWorker = await AsyncStorage.getItem('worker');
            const token = await AsyncStorage.getItem('workerToken');

            if (storedWorker && token) {
                setWorker(JSON.parse(storedWorker));
                socketService.connect();
            }
        } catch (error) {
            console.error('Error loading worker:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (workerData: Worker, token: string) => {
        try {
            // Store token and worker data
            await AsyncStorage.setItem('workerToken', token);
            await AsyncStorage.setItem('worker', JSON.stringify(workerData));

            setWorker(workerData);
            socketService.connect();
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error('Login failed');
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('workerToken');
            await AsyncStorage.removeItem('worker');
            setWorker(null);
            socketService.disconnect();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateWorker = (updatedWorker: Worker) => {
        setWorker(updatedWorker);
        AsyncStorage.setItem('worker', JSON.stringify(updatedWorker));
    };

    const refreshWorker = async () => {
        try {
            if (!worker?._id) return;
            const response = await api.get(`/workers/${worker._id}`);
            const updatedWorker = response.data;
            setWorker(updatedWorker);
            AsyncStorage.setItem('worker', JSON.stringify(updatedWorker));
        } catch (error) {
            console.error('Error refreshing worker:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                worker,
                isAuthenticated: !!worker,
                loading,
                login,
                logout,
                updateWorker,
                refreshWorker,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
