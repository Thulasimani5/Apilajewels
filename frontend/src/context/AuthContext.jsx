import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && (savedToken.startsWith('fake-') || savedToken.includes('fake-'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return savedToken;
  });

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && (savedToken.startsWith('fake-') || savedToken.includes('fake-'))) {
      return null;
    }
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (userData, jwtToken) => {
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoginOpen, openLogin, closeLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
