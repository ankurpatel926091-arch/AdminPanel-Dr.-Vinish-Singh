import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, getAdminProfile, logoutAdmin } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('dr_vinish_admin_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth status on initial load or browser refresh
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dr_vinish_admin_token');
      if (storedToken) {
        try {
          const res = await getAdminProfile();
          if (res.success && res.admin) {
            setUser(res.admin);
            setIsAuthenticated(true);
            setToken(storedToken);
          } else {
            handleLocalLogout();
          }
        } catch (error) {
          console.error('Failed to verify session token:', error);
          handleLocalLogout();
        }
      } else {
        handleLocalLogout();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLocalLogout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('dr_vinish_admin_token');
    localStorage.removeItem('dr_vinish_admin_user');
  };

  const login = async (email, password) => {
    try {
      const res = await loginAdmin(email, password);
      if (res.success && res.token) {
        const adminData = res.admin;
        setUser(adminData);
        setToken(res.token);
        setIsAuthenticated(true);
        localStorage.setItem('dr_vinish_admin_token', res.token);
        localStorage.setItem('dr_vinish_admin_user', JSON.stringify(adminData));
        return { success: true };
      } else {
        return { success: false, message: res.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login request error:', error);
      const errorMsg = error.response?.data?.message || 'Server error. Please ensure backend is running.';
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleLocalLogout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
