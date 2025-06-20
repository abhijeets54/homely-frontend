import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cart, CartItem } from '../types/models';
import { client } from './client';
import { useCartStore } from '../store/cartStore';

// Cart API service
export const cartApi = {
  // Get cart for a customer
  async getCart(): Promise<Cart> {
    try {
      // The backend uses the token to identify the user
      const response = await client.get(`/api/cart`);
      return response.data.cart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(foodItemId: string, quantity: number): Promise<Cart> {
    try {
      console.log('Adding to cart:', { foodItemId, quantity });
      
      // Ensure we have a valid token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        console.error('No token available when adding to cart');
        throw new Error('Authentication required. Please login to add items to cart.');
      }
      
      // Make sure we're using the correct endpoint format
      const response = await client.post('/api/cart/items', {
        foodItemId,
        quantity: Number(quantity) // Ensure quantity is a number
      });
      
      console.log('Add to cart response:', response.status, response.data);
      
      if (response.data && response.data.cart) {
        return response.data.cart;
      }
      
      // If the response doesn't include the cart, fetch it separately
      const updatedCart = await this.getCart();
      return updatedCart;
    } catch (error: any) {
      console.error('Error adding item to cart:', error);
      // Provide more specific error messages based on the response
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new Error('Your session has expired. Please login again.');
        } else if (status === 403) {
          throw new Error('You do not have permission to add items to cart. Only customers can add items.');
        } else if (status === 404) {
          throw new Error('The food item you are trying to add could not be found.');
        } else if (status === 400) {
          const message = error.response.data?.message || 'Invalid request. Please check the item details.';
          throw new Error(message);
        }
      }
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(cartItemId: string, quantity: number): Promise<Cart> {
    try {
      // Ensure we have a valid token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        console.error('No token available when updating cart');
        throw new Error('Authentication required. Please login to update items in cart.');
      }

      const response = await client.put(`/api/cart/items/${cartItemId}`, {
        quantity: Number(quantity) // Ensure quantity is a number
      });
      
      // If the response includes the updated cart, return it
      if (response.data && response.data.cart) {
        return response.data.cart;
      }
      
      // Otherwise fetch the latest cart data
      const updatedCart = await this.getCart();
      return updatedCart;
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      // Provide more specific error messages based on the response
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new Error('Your session has expired. Please login again.');
        } else if (status === 403) {
          throw new Error('You do not have permission to update items in cart.');
        } else if (status === 404) {
          throw new Error('The cart item you are trying to update could not be found.');
        } else if (status === 400) {
          const message = error.response.data?.message || 'Invalid request. Please check the item details.';
          throw new Error(message);
        }
      }
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<Cart> {
    try {
      // Ensure we have a valid token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        console.error('No token available when removing from cart');
        throw new Error('Authentication required. Please login to remove items from cart.');
      }

      const response = await client.delete(`/api/cart/items/${cartItemId}`);
      
      // If the response includes the updated cart, return it
      if (response.data && response.data.cart) {
        return response.data.cart;
      }
      
      // Otherwise fetch the latest cart data
      const updatedCart = await this.getCart();
      return updatedCart;
    } catch (error: any) {
      console.error('Error removing item from cart:', error);
      // Provide more specific error messages based on the response
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new Error('Your session has expired. Please login again.');
        } else if (status === 403) {
          throw new Error('You do not have permission to remove items from cart.');
        } else if (status === 404) {
          throw new Error('The cart item you are trying to remove could not be found.');
        }
      }
      throw error;
    }
  },

  // Clear cart
  async clearCart(): Promise<Cart> {
    try {
      await client.delete(`/api/cart`);
      
      // Return an empty cart after clearing
      const updatedCart = await this.getCart();
      return updatedCart;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Update cart status
  async updateCartStatus(status: 'active' | 'checkout'): Promise<Cart> {
    try {
      const response = await client.put(`/api/cart/status`, { status });
      return response.data.cart;
    } catch (error) {
      console.error('Error updating cart status:', error);
      throw error;
    }
  },

  // Checkout cart
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
    queryFn: async () => {
      const cart = await cartApi.getCart();
      return cart;
    },
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnReconnect: false, // Don't refetch when reconnecting
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ foodItemId, quantity }: { foodItemId: string; quantity: number }) => {
      console.log('useAddToCart mutation executing with:', { foodItemId, quantity });
      return cartApi.addToCart(foodItemId, quantity);
    },
    onSuccess: (data) => {
      console.log('Cart updated successfully');
      queryClient.setQueryData(['cart'], data); // Update cache directly
    },
    onError: (error) => {
      console.error('useAddToCart mutation error:', error);
    }
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