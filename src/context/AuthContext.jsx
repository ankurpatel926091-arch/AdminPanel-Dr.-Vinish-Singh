import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('dr_vinish_admin_user');
    return savedUser ? JSON.parse(savedUser) : {
      name: 'Dr. Vinish Singh',
      role: 'Administrator',
      email: 'admin@drvinish.com',
      avatar: '/assets/doctor.jpg'
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('dr_vinish_admin_auth') === 'true';
  });

  const login = (email, password) => {
    // Demo login verification
    const adminUser = {
      name: 'Dr. Vinish Singh',
      role: 'Administrator',
      email: email || 'admin@drvinish.com',
      avatar: '/assets/doctor.jpg'
    };
    setUser(adminUser);
    setIsAuthenticated(true);
    localStorage.setItem('dr_vinish_admin_user', JSON.stringify(adminUser));
    localStorage.setItem('dr_vinish_admin_auth', 'true');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('dr_vinish_admin_auth');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
