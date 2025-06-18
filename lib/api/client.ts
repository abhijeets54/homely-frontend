import axios from 'axios';
import { getCookie } from 'cookies-next';
import { API_URL } from '../api-config';

// Define the base URL for API requests
const BASE_URL = API_URL; // Use the API_URL from our config

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for large image uploads
  withCredentials: true, // Important for cookies
});

// Add a request interceptor to include the auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    // Try to get token from cookies first (for SSR), then localStorage (for client-side)
    let token;
    try {
      // For client-side, prioritize localStorage first as it's more reliable
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? 'Found' : 'Not found');
      }
      
      // If no token in localStorage, try cookies
      if (!token) {
        token = getCookie('token');
        console.log('Token from cookies:', token ? 'Found' : 'Not found');
      }
    } catch (error) {
      console.error('Error accessing token:', error);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${typeof token === 'string' ? token.substring(0, 10) : token}...`);
    } else {
      console.warn('No auth token available for request to:', config.url);
    }
    
    // Special handling for DELETE requests
    if (config.method === 'delete') {
      console.log('DELETE request detected - ensuring proper headers and auth');
      // Make sure the Authorization header is set
      if (!config.headers.Authorization && token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log the request details
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    
    const { response } = error;
    
    // Handle specific error cases
    if (response && response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Authentication error: Your session has expired');
      
      if (typeof window !== 'undefined') {
        // Clear token
        localStorage.removeItem('token');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Export both default and named export for flexibility
export { apiClient as client };
export default apiClient;
