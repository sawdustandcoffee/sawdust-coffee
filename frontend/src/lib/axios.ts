import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true, // Important for Sanctum to work with cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for CSRF token
api.interceptors.request.use(
  async (config) => {
    // Get CSRF cookie before making requests
    if (config.method !== 'get') {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const csrfUrl = baseURL.replace('/api', '/sanctum/csrf-cookie');
      await axios.get(csrfUrl, {
        withCredentials: true,
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't automatically redirect on 401 - let components handle auth errors
    // Protected routes already handle authentication via ProtectedRoute component
    return Promise.reject(error);
  }
);

export default api;
