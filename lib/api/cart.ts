import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cart, CartItem } from '../types/models';
import { client } from './client';

// Cart API service
export const cartApi = {
  // Get cart for a customer
  async getCart(): Promise<Cart> {
    try {
      // The backend uses the token to identify the user
      const response = await client.get(`/api/cart`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(foodItemId: string, quantity: number): Promise<Cart> {
    try {
      const response = await client.post(`/api/cart/items`, {
        foodItemId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(cartItemId: string, quantity: number): Promise<Cart> {
    try {
      const response = await client.put(`/api/cart/items/${cartItemId}`, {
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<Cart> {
    try {
      const response = await client.delete(`/api/cart/items/${cartItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },

  // Clear cart
  async clearCart(): Promise<Cart> {
    try {
      // Updated to match the backend route
      const response = await client.delete(`/api/cart`);
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Update cart status (this might need to be implemented in the backend)
  async updateCartStatus(status: 'active' | 'checkout'): Promise<Cart> {
    try {
      const response = await client.put(`/api/cart/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating cart status:', error);
      throw error;
    }
  },

  // Checkout cart (this might need to be implemented in the backend)
  async checkout(deliveryAddress: string, specialInstructions?: string): Promise<any> {
    try {
      const response = await client.post(`/api/cart/checkout`, {
        deliveryAddress,
        specialInstructions
      });
      return response.data;
    } catch (error) {
      console.error('Error checking out cart:', error);
      throw error;
    }
  }
};

// Custom hooks for cart
export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ foodItemId, quantity }: { foodItemId: string; quantity: number }) => 
      cartApi.addToCart(foodItemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => 
      cartApi.updateCartItem(cartItemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cartItemId: string) => 
      cartApi.removeFromCart(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateCartStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (status: 'active' | 'checkout') => 
      cartApi.updateCartStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ deliveryAddress, specialInstructions }: { deliveryAddress: string; specialInstructions?: string }) => 
      cartApi.checkout(deliveryAddress, specialInstructions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}; 