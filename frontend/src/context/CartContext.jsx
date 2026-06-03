import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Initial Load of Cart items
  useEffect(() => {
    const loadCart = async () => {
      if (token) {
        try {
          const res = await fetch('http://localhost:5001/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await res.json();
          if (result.success && result.data.cart) {
            setCartItems(result.data.cart);
          } else {
            const saved = localStorage.getItem('cart');
            if (saved) setCartItems(JSON.parse(saved));
          }
        } catch (e) {
          console.error("Error fetching cart from DB:", e);
          const saved = localStorage.getItem('cart');
          if (saved) setCartItems(JSON.parse(saved));
        }
      } else {
        const saved = localStorage.getItem('cart');
        if (saved) setCartItems(saved ? JSON.parse(saved) : []);
      }
      setIsInitialized(true);
    };
    loadCart();
  }, [token]);

  // 2. Sync to localStorage & DB on changes
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('cart', JSON.stringify(cartItems));

    const syncCart = async () => {
      if (token) {
        try {
          await fetch('http://localhost:5001/api/auth/cart', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cartItems: cartItems.map(item => item._id) })
          });
        } catch (e) {
          console.error("Error syncing cart to DB:", e);
        }
      }
    };
    syncCart();
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
