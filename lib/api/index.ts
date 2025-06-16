import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  AuthResponse, Customer, Seller, Category, 
  FoodItem, Cart, Order, DeliveryAssignment, Payment 
} from '../types';
import { API_URL } from '../api-config';

// Export all API services
export * from './client';
export * from './auth';
export * from './customer';
export * from './seller';
export * from './food';
export * from './cart';
export * from './payment';
export * from './review';
export * from './orders';
export * from './notification';

// Re-export specific hooks or utilities
import { useCart } from './cart';
import { useGetCustomerOrders, useGetSellerOrders, useGetOrder } from './orders';
import { usePayment, usePaymentByOrder } from './payment';
import { useRestaurantReviews, useFoodItemReviews } from './review';
import { useNotifications } from './notification';

export { 
  useCart, 
  useGetCustomerOrders,
  useGetSellerOrders,
  useGetOrder,
  usePayment, 
  usePaymentByOrder,
  useRestaurantReviews,
  useFoodItemReviews,
  useNotifications
};

// Use the API_URL from our config and append /api
const API_ENDPOINT = `${API_URL}/api`;

const api = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: { email: string; password: string; role: 'customer' | 'seller' }) => {
      const response = await api.post<AuthResponse>(`/auth/login`, data);
      return response.data;
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: { 
      name: string; 
      email: string; 
      password: string; 
      address: string; 
      phoneNumber: string;
      role: 'customer' | 'seller';
    }) => {
      const response = await api.post<AuthResponse>(`/auth/register/${data.role}`, {
        ...data,
        phone: data.phoneNumber,
        role: undefined
      });
      return response.data;
    },
  });
};

// Seller API
export const useSeller = (id: string) => {
  return useQuery({
    queryKey: ['seller', id],
    queryFn: async () => {
      const response = await api.get<Seller>(`/seller/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useSellers = () => {
  return useQuery({
    queryKey: ['sellers'],
    queryFn: async () => {
      const response = await api.get<Seller[]>('/seller');
      return response.data;
    },
  });
};

// Category API
export const useCategories = (restaurantId: string) => {
  return useQuery({
    queryKey: ['categories', restaurantId],
    queryFn: async () => {
      const response = await api.get<Category[]>(`/category/seller/${restaurantId}`);
      return response.data;
    },
    enabled: !!restaurantId,
  });
};

// Food Items API
export const useFoodItems = (restaurantId: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['foodItems', restaurantId, categoryId],
    queryFn: async () => {
      const url = categoryId 
        ? `/food/category/${categoryId}` 
        : `/food/seller/${restaurantId}`;
      const response = await api.get<FoodItem[]>(url);
      return response.data;
    },
    enabled: !!restaurantId,
  });
};

// Cart API
export const useUpdateCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cartId, items }: { cartId: string; items: { foodItemId: string; quantity: number }[] }) => {
      const response = await api.put<Cart>(`/cart/items`, { items });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Order API
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await api.post<Order>('/order', orderData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// We keep the DeliveryAssignment type for Order status tracking
// but remove the delivery API functionality

// Payment API
export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (paymentData: Omit<Payment, 'id'>) => {
      const response = await api.post<Payment>('/payment/create-intent', paymentData);
      return response.data;
    },
  });
}; 