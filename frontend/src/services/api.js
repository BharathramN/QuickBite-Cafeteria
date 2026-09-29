import axios from 'axios';

// Configurable backend API base URL for production deployment
// When deployed on Render (e.g. VITE_API_BASE_URL=https://quickbite-api.onrender.com),
// it automatically formats to https://quickbite-api.onrender.com/api
// For local development with Vite proxy, defaults to '/api'
const rawBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';
const baseURL = rawBaseURL.endsWith('/api')
  ? rawBaseURL
  : `${rawBaseURL.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quickbite_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('quickbite_token');
        localStorage.removeItem('quickbite_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
