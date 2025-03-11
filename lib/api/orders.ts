import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order, OrderItem } from '../types/models';
import { client } from './client';

// Order API service
export const orderApi = {
  // Get orders for a customer
  async getCustomerOrders(): Promise<Order[]> {
    try {
      const response = await client.get(`/api/customer/orders`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  },

  // Get orders for a seller
  async getSellerOrders(): Promise<Order[]> {
    try {
      const response = await client.get(`/api/seller/orders`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      throw error;
    }
  },

  // Get a specific order
  async getOrderDetails(orderId: string): Promise<Order> {
    try {
      const response = await client.get(`/api/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Get customer order details
  async getCustomerOrderDetails(orderId: string): Promise<Order> {
    try {
      const response = await client.get(`/api/customer/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer order details:', error);
      throw error;
    }
  },

  // Create a new order
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      const response = await client.post('/api/order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const response = await client.put(`/api/order/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Cancel an order
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await client.put(`/api/order/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
};

// Custom hooks for orders
export const useOrders = (role: 'customer' | 'seller') => {
  return useQuery({
    queryKey: ['orders', role],
    queryFn: async () => {
      if (role === 'customer') {
        return await orderApi.getCustomerOrders();
      } else {
        return await orderApi.getSellerOrders();
      }
    },
  });
};

export const useOrder = (orderId: string, role?: 'customer' | 'seller') => {
  return useQuery({
    queryKey: ['order', orderId, role],
    queryFn: () => {
      if (role === 'customer') {
        return orderApi.getCustomerOrderDetails(orderId);
      }
      return orderApi.getOrderDetails(orderId);
    },
    enabled: !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: Partial<Order>) => orderApi.createOrder(orderData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      return data;
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      orderApi.updateOrderStatus(orderId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      return data;
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) => 
      orderApi.cancelOrder(orderId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      return data;
    },
  });
}; 