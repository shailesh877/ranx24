import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { CartItem, CartContextType } from '../types';

import { useAuth } from './AuthContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCartItems([]);
        }
    }, [isAuthenticated]);

    const fetchCart = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await api.get('/cart');
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (item: Omit<CartItem, '_id'>): Promise<any> => {
        try {
            const response = await api.post('/cart/add', item);
            await fetchCart();
            Toast.show({
                type: 'success',
                text1: 'Added to Cart',
                text2: 'Item added successfully',
            });
            return response.data;
        } catch (error) {
            console.error('Error adding to cart:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: (error as any).response?.data?.message || 'Failed to add to cart',
            });
            throw error;
        }
    };

    const removeFromCart = async (itemId: string): Promise<void> => {
        try {
            await api.delete(`/cart/remove/${itemId}`);
            await fetchCart();
            Toast.show({
                type: 'success',
                text1: 'Removed',
                text2: 'Item removed from cart',
            });
        } catch (error) {
            console.error('Error removing from cart:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to remove item',
            });
        }
    };

    const clearCart = async (): Promise<void> => {
        try {
            await api.delete('/cart/clear');
            setCartItems([]);
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const value: CartContextType = {
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
