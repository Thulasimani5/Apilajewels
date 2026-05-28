import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const toggleWishlist = (jewellery) => {
    setWishlistItems(prev => {
      const exists = prev.find(item => item._id === jewellery._id);
      if (exists) {
        return prev.filter(item => item._id !== jewellery._id);
      }
      return [...prev, jewellery];
    });
  };

  const isInWishlist = (id) => {
    return wishlistItems.some(item => item._id === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
