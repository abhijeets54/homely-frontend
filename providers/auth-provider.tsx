'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../lib/api/auth';
import { User, UserRole } from '../lib/types/auth';
import { LoginData, RegisterData } from '../lib/types/auth';
import Cookies from 'js-cookie';


interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    setIsInitializing(true);

    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Check if we have a token in localStorage or cookies
        const token = localStorage.getItem('token') || Cookies.get('token');

        if (token) {
          // console.log('Found token, fetching user data');

          // Ensure token is in both localStorage and cookies
          localStorage.setItem('token', token);
          Cookies.set('token', token, { expires: 7, path: '/' });

          try {
            // Fetch current user data
            const response = await authApi.getCurrentUser();

            if (response.user) {
              setUser(response.user);
              setRole(response.userType as UserRole); // Set role based on userType
              setIsAuthenticated(true);

              // Set userType cookie
              Cookies.set('userType', response.user.role, { expires: 7, path: '/' });

              console.log('User authenticated:', response.user);
            } else {
              // Clear invalid auth data
              localStorage.removeItem('token');
              Cookies.remove('token');
              Cookies.remove('userType');
              console.log('Invalid user data, cleared auth state');
              setError('Your session has expired. Please log in again.');
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
            // Clear invalid auth data
            localStorage.removeItem('token');
            Cookies.remove('token');
            Cookies.remove('userType');
          }
        } else {
          console.log('No token found');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // On app initialization, retrieve the role
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole as UserRole);
    }
  }, []);

  useEffect(() => {
    // console.log('Auth state updated:', { user, role, isAuthenticated });
  }, [user, role, isAuthenticated]);

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Logging in with data:', { ...data, password: '***' });

      const response = await authApi.login(data);

      if (response.token && response.user) {
        // Save token to localStorage and cookies
        localStorage.setItem('token', response.token);
        Cookies.set('token', response.token, { expires: 7, path: '/' });

        // Save userType to cookies
        Cookies.set('userType', response.user.role, { expires: 7, path: '/' });

        // Save user data
        setUser(response.user);
        setRole(response.userType as UserRole); // Set role based on userType
        setIsAuthenticated(true);

        // console.log('Login successful, redirecting based on role');

        // Redirect based on role
        if (response.user.role === 'customer') {
          router.push('/customer/dashboard');
        } else if (response.user.role === 'seller') {
          router.push('/seller/dashboard');
        } else if (response.user.role === 'delivery') {
          router.push('/delivery/dashboard');
        } else {
          router.push('/');
        }
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Registering with data:', { ...data, password: '***' });

      const response = await authApi.register(data);
      // console.log('Registration API response:', response);

      if (response.token && response.user) {
        // Save token to localStorage and cookies
        localStorage.setItem('token', response.token);
        Cookies.set('token', response.token, { expires: 7, path: '/' });

        // Save userType to cookies
        const userRole = response.user.role || data.role;
        Cookies.set('userType', userRole, { expires: 7, path: '/' });

        // Save user data
        setUser(response.user);
        setRole(userRole as UserRole);
        setIsAuthenticated(true);

        console.log('Registration successful, redirecting based on role:', userRole);

        // Redirect based on role
        if (userRole === 'customer') {
          router.push('/customer/dashboard');
        } else if (userRole === 'seller') {
          router.push('/seller/dashboard');
        } else if (userRole === 'delivery') {
          router.push('/delivery/dashboard');
        } else {
          router.push('/');
        }
      } else {
        throw new Error('Invalid registration response');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Call the logout API (client-side only)
      await authApi.logout();

      // Clear auth state
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);

      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);

      // Clear local state
      localStorage.removeItem('token');
      Cookies.remove('token');
      Cookies.remove('userType');

      // Clear auth state
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);

      // Redirect to home page
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    role,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {isInitializing ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // console.log('Auth context:', { user: context.user, role: context.role, isAuthenticated: context.isAuthenticated });
  return context;
};

export default AuthProvider;
