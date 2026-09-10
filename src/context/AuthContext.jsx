import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { loginAdmin, getAdminProfile, logoutAdmin } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('dr_vinish_admin_user');
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      if (parsed) {
        parsed.role = (parsed.role === 'Administrator' || parsed.role === 'admin') ? 'admin' : null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('dr_vinish_admin_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('dr_vinish_admin_token')));
  const [loading, setLoading] = useState(true);

  // Helper to normalize user object
  const normalizeUserData = (rawUser) => {
    if (!rawUser) return null;
    const role = (rawUser.role === 'Administrator' || rawUser.role === 'admin') ? 'admin' : null;
    return {
      ...rawUser,
      role
    };
  };

  // Check auth status on initial load or browser refresh
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dr_vinish_admin_token');
      if (storedToken) {
        try {
          const res = await getAdminProfile();
          if (res.success && res.admin) {
            const normalizedUser = normalizeUserData(res.admin);
            setUser(normalizedUser);
            setIsAuthenticated(true);
            setToken(storedToken);
            localStorage.setItem('dr_vinish_admin_user', JSON.stringify(normalizedUser));
          } else {
            handleLocalLogout();
            sessionStorage.setItem(
              'admin_toast',
              JSON.stringify({
                type: 'error',
                message: 'Session expired! Please login again.'
              })
            );
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
        const normalizedUser = normalizeUserData(res.admin);
        setUser(normalizedUser);
        setToken(res.token);
        setIsAuthenticated(true);
        localStorage.setItem('dr_vinish_admin_token', res.token);
        localStorage.setItem('dr_vinish_admin_user', JSON.stringify(normalizedUser));
        return { success: true, user: normalizedUser };
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
      toast.info('Logged out successfully');
    }
  };

  const role = user?.role || null;
  const isAdmin = role === 'admin';
  const isDoctor = role === 'doctor';

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, role, isAdmin, isDoctor, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

