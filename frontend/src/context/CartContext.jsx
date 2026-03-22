import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      const { data } = await axiosInstance.get('/cart');
      setCartItems(data.items || data); // Handle both array and object response if needed
    } catch (error) {
      console.error("Error fetching cart:", error);
      // toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (arg1, category, service, description, price, quantity = 1, bookingType = 'full-day', days = 1, startDate = null, endDate = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to add to cart");
        return;
      }

      let payload = {};
      if (typeof arg1 === 'object' && arg1 !== null) {
        // Called with object
        payload = { ...arg1 };
        // Map fields if necessary, e.g. serviceName -> service
        if (payload.serviceName) payload.service = payload.serviceName;
        if (!payload.quantity) payload.quantity = 1;
      } else {
        // Called with individual args
        payload = {
          workerId: arg1,
          category,
          service,
          description,
          price,
          quantity,
          bookingType,
          days,
          startDate,
          endDate
        };
      }

      await axiosInstance.post('/cart/add', payload);
      toast.success("Item added to cart");
      fetchCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axiosInstance.delete(`/cart/remove/${itemId}`);
      toast.success("Item removed from cart");
      fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      await axiosInstance.delete('/cart/clear');
      setCartItems([]);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, fetchCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};
