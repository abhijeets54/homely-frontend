/**
 * API Configuration Utility
 * 
 * This file provides the base API URL configuration for different environments.
 * It automatically selects the appropriate URL based on the current environment.
 */

const getApiUrl = () => {
  // Use the environment variable if available
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }

  // Fallback for production if environment variable is not set
  return 'https://homely-backend.onrender.com';
};

export const API_URL = getApiUrl();

/**
 * Helper function to build API endpoint URLs
 * @param {string} path - The API endpoint path
 * @returns {string} The complete API URL
 */
export const apiEndpoint = (path) => {
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export default {
  API_URL,
  apiEndpoint
}; 