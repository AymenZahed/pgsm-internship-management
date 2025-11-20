import axios from 'axios';
import { useAuthStore } from '@/store/modules/auth';
import router from '@/router';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from auth store
    const authStore = useAuthStore();
    const token = authStore.accessToken;
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();
    
    // Handle network errors
    if (!error.response) {
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;
    
    // Handle 401 Unauthorized (token expired or invalid)
    if (status === 401) {
      // If this is a refresh token request, redirect to login
      if (originalRequest.url.includes('/auth/refresh-token')) {
        authStore.logout();
        router.push({ name: 'login', query: { sessionExpired: 'true' } });
        return Promise.reject(error);
      }
      
      // Try to refresh token if this is the first attempt
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          await authStore.refreshToken();
          
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token is invalid, log out the user
          authStore.logout();
          router.push({ name: 'login', query: { sessionExpired: 'true' } });
          return Promise.reject(refreshError);
        }
      }
    }
    
    // Handle other error statuses
    switch (status) {
      case 400:
        return Promise.reject(new Error(data.error || data.message || 'Bad request'));
      case 403:
        router.push({ name: 'forbidden' });
        return Promise.reject(new Error('You are not authorized to perform this action'));
      case 404:
        router.push({ name: 'not-found' });
        return Promise.reject(new Error('The requested resource was not found'));
      case 422:
        return Promise.reject(new Error(data.message || 'Validation failed'));
      case 429:
        return Promise.reject(new Error('Too many requests. Please try again later.'));
      case 500:
        router.push({ name: 'server-error' });
        return Promise.reject(new Error('Server error. Please try again later.'));
      default:
        return Promise.reject(new Error(data.error || data.message || 'An error occurred'));
    }
  }
);

export default api;
