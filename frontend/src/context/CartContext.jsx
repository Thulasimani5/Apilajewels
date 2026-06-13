import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from './AuthContext';

// Configure axios globally to send cookies
axios.defaults.withCredentials = true;

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const firstRender = useRef(true);

  // 1. Initial Load of Cart items from server (handles both guest and logged-in via cookie/token)
  useEffect(() => {
    const loadCart = async () => {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE_URL}/api/cart`, { headers });
        if (res.data.success && res.data.data) {
          setCartItems(res.data.data);
        }
      } catch (e) {
        console.error("Error fetching cart from DB:", e);
      } finally {
        setIsInitialized(true);
      }
    };
    loadCart();
  }, [token]); // Re-fetch cart when token changes (e.g., login/logout)

  // 2. Sync to DB on changes
  useEffect(() => {
    if (!isInitialized) return;
    
    // Skip sync on the very first render to prevent clearing the DB if cartItems is initially empty before load
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const syncCart = async () => {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        await axios.put(`${API_BASE_URL}/api/cart`, {
          cartItems: cartItems.map(item => item._id)
        }, { headers });
      } catch (e) {
        console.error("Error syncing cart to DB:", e);
      }
    };
    
    // Debounce the sync slightly to prevent rapid firing
    const timeoutId = setTimeout(() => {
      syncCart();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cartItems, token, isInitialized]);

  const addToCart = (jewellery) => {
    setCartItems(prev => {
      if (prev.find(item => item._id === jewellery._id)) {
        return prev;
      }
      return [...prev, jewellery];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  const clearCart = () => setCartItems([]);

  const totalAmount = cartItems.reduce((total, item) => total + (item.rentalPrice || item.price || 0), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};
