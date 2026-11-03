import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return 'https://dr-vinish-backend.onrender.com/api';
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dr_vinish_admin_token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 unauthorized errors and automatic online fallback
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const fallbackBaseUrl = 'https://dr-vinish-backend.onrender.com/api';
      originalRequest.baseURL = fallbackBaseUrl;
      try {
        return await axios(originalRequest);
      } catch (fallbackErr) {
        // Continue to reject with fallback error
      }
    }

    if (error.response && error.response.status === 401) {
      const hadToken = Boolean(localStorage.getItem('dr_vinish_admin_token'));
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

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
