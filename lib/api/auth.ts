import { AuthResponse, LoginData, RegisterData, UpdateProfileData } from '../types/auth';
import Cookies from 'js-cookie';
import { client } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Log API configuration for debugging
console.log('API Configuration:', { 
  API_URL, 
  USE_MOCK_API,
  NODE_ENV: process.env.NODE_ENV
});

// Common fetch options for all API calls
const getCommonFetchOptions = (): RequestInit => ({
  credentials: 'include',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Helper function to handle API responses
const handleApiResponse = async (response: Response): Promise<any> => {
  // Log response status and headers for debugging
  console.log(`Response status: ${response.status} ${response.statusText}`);
  console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
  
  if (!response.ok) {
    // Try to get error message from response
    let errorMessage = `Server responded with status: ${response.status}`;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
    } catch (e) {
      console.error('Error parsing error response:', e);
    }
    throw new Error(errorMessage);
  }

  // Try to parse response as JSON
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      console.warn('Received non-JSON response:', text);
      return { message: text };
    }
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    throw new Error('Failed to parse server response');
  }
};

// Auth API service
export const authApi = {
  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('Login payload:', data); // Log the payload for debugging
      const response = await client.post('/api/auth/login', {
        email: data.email,
        password: data.password,
        role: data.role
      });
      
      // Log the response for debugging
      console.log('Login response:', response);
      
      // Store token in localStorage and cookies for persistence
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        Cookies.set('token', response.data.token, { expires: 7, path: '/' });
        Cookies.set('userType', data.role, { expires: 7, path: '/' });
      }
      
      console.log('login response:', response);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Transform data to match backend structure
      const payload = {
        ...data,
        // Ensure phone field is correctly named for backend
        ...(data.phoneNumber && { phone: data.phoneNumber }),
        // Remove role from payload as it's in the URL
        role: undefined
      };
      
      const response = await client.post(`/api/auth/register/${data.role}`, payload);
      
      // Store token in localStorage and cookies for persistence
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        Cookies.set('token', response.data.token, { expires: 7, path: '/' });
        Cookies.set('userType', data.role, { expires: 7, path: '/' });
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Get current user
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await client.get('/api/auth/me');
      console.log('getCurrentUser response:', response);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
    try {
      // Transform data to match backend structure
      const payload = {
        ...data,
        // Ensure phone field is correctly named for backend
        ...(data.phoneNumber && { phone: data.phoneNumber })
      };
      
      const response = await client.put('/api/auth/profile', payload);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
  
  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await client.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },
  
  // Logout user
  async logout(): Promise<void> {
    try {
      // Try to call the logout endpoint, but don't wait for it
      // This way, even if the endpoint doesn't exist, we still clear local state
      client.post('/api/auth/logout').catch(err => {
        console.log('Logout endpoint not available, clearing local state only');
      });
      
      // Clear token from localStorage and cookies
      localStorage.removeItem('token');
      Cookies.remove('token');
      Cookies.remove('userType');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still clear local tokens even if server logout fails
      localStorage.removeItem('token');
      Cookies.remove('token');
      Cookies.remove('userType');
    }
  }
};

export default authApi;
