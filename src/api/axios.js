import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dr-vinish-backend.onrender.com/api';

const API = axios.create({
  baseURL: API_BASE_URL,
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
      // Token might be invalid or expired
      localStorage.removeItem('dr_vinish_admin_token');
      localStorage.removeItem('dr_vinish_admin_user');
    }
    return Promise.reject(error);
  }
);

export default API;
