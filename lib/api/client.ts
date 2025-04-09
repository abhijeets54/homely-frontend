import axios from 'axios';
import { getCookie } from 'cookies-next';

// Define the base URL for API requests
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // Updated to port 5000

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Important for cookies
});

// Add a request interceptor to include the auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle specific error cases
    if (response && response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      alert('Your session has expired. Please log in again.');
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
