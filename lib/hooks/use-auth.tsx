'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Customer, Seller, UserRole, AuthResponse, LoginData, RegisterData } from '@/lib/types';
import { authApi } from '@/lib/api/auth';

interface AuthContextType {
  user: Customer | Seller | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  logout: () => void;
  register: (data: RegisterData) => Promise<AuthResponse>;
  updateProfile: (data: Partial<RegisterData>) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_COOKIE = 'token';
const USER_TYPE_COOKIE = 'userType';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Customer | Seller | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get(TOKEN_COOKIE);
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.getCurrentUser(token);
      setUser(response.user);
      setRole(response.userType as UserRole);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid auth state
      Cookies.remove(TOKEN_COOKIE);
      Cookies.remove(USER_TYPE_COOKIE);
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await authApi.login(data);
    
    // Set cookies with appropriate security options
    Cookies.set(TOKEN_COOKIE, response.token, {
      expires: 1, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    Cookies.set(USER_TYPE_COOKIE, response.userType, {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    setUser(response.user);
    setRole(response.userType as UserRole);

    return response;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await authApi.register(data);
    
    // Set cookies with appropriate security options
    Cookies.set(TOKEN_COOKIE, response.token, {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    Cookies.set(USER_TYPE_COOKIE, response.userType, {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    setUser(response.user);
    setRole(response.userType as UserRole);

    return response;
  };

  const updateProfile = async (data: Partial<RegisterData>): Promise<AuthResponse> => {
    const token = Cookies.get(TOKEN_COOKIE);
    if (!token) throw new Error('Not authenticated');

    const response = await authApi.updateProfile(token, data);
    setUser(response.user);

    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      Cookies.remove(TOKEN_COOKIE);
      Cookies.remove(USER_TYPE_COOKIE);
      setUser(null);
      setRole(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login,
        logout,
        register,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 