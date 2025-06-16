import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Set the API URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Type definitions
export interface OrderItem {
  foodItemId: string;
  name: string;
  quantity: number;
  price: number;
  restaurantId?: string;
}

export interface CreateOrderData {
  userId: string;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  specialInstructions?: string;
  status?: 'pending' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'wallet';
  restaurantId: string;
  createdAt?: string;
}

export interface Order extends CreateOrderData {
  id: string;
  _id?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  updatedAt: string;
}

// Helper function to get the API token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Order API endpoints
export const orderApi = {
  // Create a new order
  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    try {
      const response = await axios.post(`${API_URL}/api/orders`, orderData, { headers });
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      // For demo, create a mock response with random ID if API fails
      return {
        ...orderData,
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        _id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentStatus: 'pending',
        updatedAt: new Date().toISOString()
      };
    }
  },
  
  // Get a single order by ID
  getOrder: async (orderId: string): Promise<Order> => {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    try {
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Failed to get order:', error);
      throw error;
    }
  },
  
  // Get orders for customer dashboard
  getCustomerOrders: async (userId: string): Promise<Order[]> => {
    const token = getToken();
    if (!token) throw new Error('Authentication required');
    
    try {
      const response = await axios.get(`${API_URL}/api/orders/customer/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get customer orders:', error);
      throw error;
    }
  },
  
  // Get orders for seller dashboard
  getSellerOrders: async (restaurantId: string): Promise<Order[]> => {
    const token = getToken();
    if (!token) throw new Error('Authentication required');
    
    try {
      const response = await axios.get(`${API_URL}/api/orders/seller/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get seller orders:', error);
      throw error;
    }
  },
  
  // Update order status
  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const token = getToken();
    if (!token) throw new Error('Authentication required');
    
    try {
      const response = await axios.patch(
        `${API_URL}/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }
};

// React Query hooks

// Create order from local cart
export function useCreateOrderFromLocalCart() {
  return useMutation({
    mutationFn: (orderData: CreateOrderData) => {
      return orderApi.createOrder(orderData);
    }
  });
}

// Get order by ID
export function useGetOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrder(orderId),
    enabled: !!orderId
  });
}

// Get customer orders
export function useGetCustomerOrders(userId: string) {
  return useQuery({
    queryKey: ['customerOrders', userId],
    queryFn: () => orderApi.getCustomerOrders(userId),
    enabled: !!userId
  });
}

// Get seller orders
export function useGetSellerOrders(restaurantId: string) {
  return useQuery({
    queryKey: ['sellerOrders', restaurantId],
    queryFn: () => orderApi.getSellerOrders(restaurantId),
    enabled: !!restaurantId
  });
}

// Update order status
export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => {
      return orderApi.updateOrderStatus(orderId, status);
    }
  });
} 