import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from './AuthContext';

// Configure axios globally to send cookies (needed for visitor_id cookie)
axios.defaults.withCredentials = true;

const CartContext = createContext();
const CART_STORAGE_KEY = 'apila_cart_items';

export const useCart = () => useContext(CartContext);

// ─── Helpers ────────────────────────────────────────────────────────────────
const saveToLocalStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save cart to localStorage:', e);
  }
};

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

// ─── Provider ───────────────────────────────────────────────────────────────
export const CartProvider = ({ children }) => {
  const { token } = useAuth();

  // Initialize from localStorage immediately — no loading flicker, survives all refreshes
  const [cartItems, setCartItems] = useState(() => loadFromLocalStorage());

  // Tracks whether we've finished the initial DB load so we don't overwrite the
  // freshly-loaded data with an empty sync
  const dbLoadDone = useRef(false);
  const syncTimerRef = useRef(null);

  // ── 1. Persist every cart change to localStorage immediately ──────────────
  useEffect(() => {
    saveToLocalStorage(cartItems);
  }, [cartItems]);

  // ── 2. On login/logout: load the correct cart from DB ─────────────────────
  useEffect(() => {
    const loadCartFromDB = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE_URL}/api/cart`, { headers });

        if (res.data.success && Array.isArray(res.data.data)) {
          const dbCart = res.data.data;

          if (token) {
            // Logged-in user: DB is authoritative (login merge already done on server)
            setCartItems(dbCart);
          } else {
            // Guest: merge DB cart with localStorage cart (union, no duplicates)
            // DB may have items from a previous session where the cookie was valid
            setCartItems(prev => {
              const merged = [...prev];
              dbCart.forEach(dbItem => {
                if (!merged.find(i => i._id === dbItem._id)) {
                  merged.push(dbItem);
                }
              });
              return merged;
            });
          }
        }
      } catch (e) {
        // Network error or backend unreachable — localStorage keeps the cart alive
        console.warn('Could not load cart from DB, using localStorage fallback:', e.message);
      } finally {
        dbLoadDone.current = true;
      }
    };

    dbLoadDone.current = false;
    loadCartFromDB();
  }, [token]); // Re-run when user logs in or out

  // ── 3. Debounced DB sync on every cart change ─────────────────────────────
  useEffect(() => {
    // Don't sync until the initial DB load has completed to avoid overwriting
    // DB data with the (possibly stale) localStorage snapshot
    if (!dbLoadDone.current) return;

    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.put(
          `${API_BASE_URL}/api/cart`,
          { cartItems: cartItems.map(item => item._id) },
          { headers }
        );
      } catch (e) {
        // Sync failure is non-fatal — localStorage already has the latest state
        console.warn('Cart DB sync failed (cart is safe in localStorage):', e.message);
      }
    }, 600);

    return () => clearTimeout(syncTimerRef.current);
  }, [cartItems, token]);

  // ── Cart mutations ────────────────────────────────────────────────────────
  const addToCart = (jewellery) => {
    setCartItems(prev => {
      if (prev.find(item => item._id === jewellery._id)) return prev; // no duplicates
      return [...prev, jewellery];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + (item.rentalPrice || item.price || 0),
    0
  );

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

