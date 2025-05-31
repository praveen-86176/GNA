import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, {
        hasToken: !!token,
        baseURL: config.baseURL,
        headers: config.headers
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (error.response) {
      // Server responded with error status
      console.error('❌ API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method
      });

      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Authentication error
          console.log('🔒 Authentication error - clearing stored data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          
          // Redirect to login page if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Authorization error
          console.error('🚫 Access forbidden');
          break;
          
        case 404:
          // Resource not found
          console.error('🔍 Resource not found');
          break;
          
        case 500:
          // Server error
          console.error('💥 Server error');
          break;
      }
    } else if (error.request) {
      // No response received
      console.error('❌ No response received:', {
        url: error.config?.url,
        method: error.config?.method
      });
    } else {
      // Request setup error
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;