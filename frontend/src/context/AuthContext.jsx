import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Ideally, decode JWT or fetch user details from /api/auth/me here
      // For now, simple mock
      setUser({ role: 'user', token }); 
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = (userData, jwtToken) => {
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
