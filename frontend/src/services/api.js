import axios from 'axios';

// Resolve backend API URL for production and local environments
// 1. Explicit VITE_API_BASE_URL if configured during build or runtime
// 2. Production Render deployment (either running on *.onrender.com or production build)
//    defaults to https://quickbite-backend-yjyi.onrender.com/api
// 3. Local development proxy fallback to '/api'
const resolveBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    const trimmed = envUrl.trim();
    return trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/+$/, '')}/api`;
  }

  if (
    (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) ||
    import.meta.env.PROD
  ) {
    return 'https://quickbite-backend-yjyi.onrender.com/api';
  }

  return '/api';
};

const baseURL = resolveBaseURL();

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
