import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { authApi } from '@/lib/api';
import { AuthResponse, Customer, Seller } from '@/lib/types/models';
import { LoginCredentials, RegisterData } from '@/lib/types/models';

interface UseAuthReturn {
  user: Customer | Seller | null;
  userType: 'customer' | 'seller' | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export { useAuthContext } from '@/providers/auth-provider';

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<Customer | Seller | null>(null);
  const [userType, setUserType] = useState<'customer' | 'seller' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getCookie('token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        const response = await authApi.getCurrentUser();
        handleAuthSuccess(response);
      } catch (error) {
        handleAuthError();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = (response: AuthResponse) => {
    setCookie('token', response.token, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
    setUser(response.user);
    setUserType(response.userType);
    setIsAuthenticated(true);
  };

  // Handle authentication error
  const handleAuthError = () => {
    deleteCookie('token');
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      handleAuthSuccess(response);
      
      // Redirect based on user type
      if (response.userType === 'customer') {
        router.push('/customer/dashboard');
      } else {
        router.push('/seller/dashboard');
      }
    } catch (error) {
      handleAuthError();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      handleAuthSuccess(response);
      
      // Redirect based on user type
      if (response.userType === 'customer') {
        router.push('/customer/dashboard');
      } else {
        router.push('/seller/dashboard');
      }
    } catch (error) {
      handleAuthError();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      handleAuthError();
      router.push('/login');
    } catch (error) {
      // Still logout on client side even if server fails
      handleAuthError();
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    userType,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout
  };
} 