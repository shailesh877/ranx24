import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadStoredAuth();

        // Register logout handler with API service
        // This ensures that if API gets 401, it can trigger logout here
        const { setLogoutHandler } = require('../services/api');
        setLogoutHandler(() => {
            logout();
        });
    }, []);

    const loadStoredAuth = async (): Promise<void> => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const storedToken = await AsyncStorage.getItem('token');

            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData: User, authToken: string): Promise<void> => {
        try {
            // Save to storage FIRST
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', authToken);
            await AsyncStorage.setItem('userType', userData.role || userData.userType || 'user');

            // THEN update state
            setUser(userData);
            setToken(authToken);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error saving auth data:', error);
            throw error; // Re-throw the error
        }
    };

    const logout = async (): Promise<void> => {
        try {
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);

            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userType');
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    };

    const updateUser = async (updatedUserData: Partial<User>): Promise<void> => {
        try {
            const newUser = { ...user, ...updatedUserData } as User;
            setUser(newUser);
            await AsyncStorage.setItem('user', JSON.stringify(newUser));
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
