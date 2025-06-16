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
  isInitializing: boolean;
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

  useEffect(() => {
    setIsInitializing(true);

    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Load stored user from localStorage first to avoid flash
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          setRole(parsedUser.role as UserRole);
          setIsAuthenticated(true);
        }

        const token = localStorage.getItem('token') || Cookies.get('token');

        if (token) {
          localStorage.setItem('token', token);
          Cookies.set('token', token, { expires: 7, path: '/' });

          try {
            const response = await authApi.getCurrentUser();
            if (response.user) {
              setUser(response.user);
              setRole(response.userType as UserRole);
              setIsAuthenticated(true);
              localStorage.setItem('user', JSON.stringify(response.user));
              localStorage.setItem('role', response.userType as string);
              Cookies.set('userType', response.user.role, { expires: 7, path: '/' });
            } else {
              clearAuthState();
              setError('Your session has expired. Please log in again.');
              router.push('/login');
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
            clearAuthState();
            router.push('/login');
          }
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

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole as UserRole);
    }
  }, []);

  useEffect(() => {
    if (role) {
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('role');
    }
  }, [role]);

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login(data);

      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('role', response.userType as string);
        Cookies.set('token', response.token, { expires: 7, path: '/' });
        Cookies.set('userType', response.user.role, { expires: 7, path: '/' });

        setUser(response.user);
        setRole(response.userType as UserRole);
        setIsAuthenticated(true);

        if (response.user.role === 'customer') {
          router.push('/customer/dashboard');
        } else if (response.user.role === 'seller') {
          router.push('/seller/dashboard');
        } else {
          // If somehow a delivery partner logs in through API, redirect to home
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

      const response = await authApi.register(data);

      if (response.token && response.user) {
        const userRole = response.user.role || data.role;

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('role', userRole);
        Cookies.set('token', response.token, { expires: 7, path: '/' });
        Cookies.set('userType', userRole, { expires: 7, path: '/' });

        setUser(response.user);
        setRole(userRole as UserRole);
        setIsAuthenticated(true);

        if (userRole === 'customer') {
          router.push('/customer/dashboard');
        } else if (userRole === 'seller') {
          router.push('/seller/dashboard');
        } else {
          // If somehow a delivery partner registers through API, redirect to home
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

      await authApi.logout();

      clearAuthState();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      clearAuthState();
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthState = () => {
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    Cookies.remove('token');
    Cookies.remove('userType');
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    role,
    isAuthenticated,
    isLoading,
    isInitializing,
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
  return context;
};

export default AuthProvider;
