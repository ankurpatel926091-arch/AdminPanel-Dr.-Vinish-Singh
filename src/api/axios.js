import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return 'https://dr-vinish-backend.onrender.com/api';
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dr_vinish_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = Boolean(localStorage.getItem('dr_vinish_admin_token'));

      // Token might be invalid or expired
      localStorage.removeItem('dr_vinish_admin_token');
      localStorage.removeItem('dr_vinish_admin_user');

      if (hadToken) {
        sessionStorage.setItem(
          'admin_toast',
          JSON.stringify({
            type: 'error',
            message: 'Session expired! Please login again.'
          })
        );
      }

      // Auto-redirect to login screen if currently on a protected page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
