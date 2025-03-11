import { Cart, CartItem, Customer, Order, Seller } from '../types/models';
import apiClient from './client';

export const customerApi = {
  /**
   * Get customer profile
   */
  getProfile: async (): Promise<Customer> => {
    const response = await apiClient.get<Customer>('/api/customer/profile');
    return response.data;
  },

  /**
   * Update customer profile
   */
  updateProfile: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.put<Customer>('/api/customer/profile', data);
    return response.data;
  },

  /**
   * Get customer's favorite sellers
   * Note: This endpoint may need to be implemented in the backend
   */
  getFavoriteSellers: async (): Promise<Seller[]> => {
    const response = await apiClient.get<Seller[]>('/api/customer/favorite-sellers');
    return response.data;
  },

  /**
   * Add a seller to favorites
   * Note: This endpoint may need to be implemented in the backend
   */
  addFavoriteSeller: async (sellerId: string): Promise<void> => {
    await apiClient.post(`/api/customer/favorite-sellers/${sellerId}`);
  },

  /**
   * Remove a seller from favorites
   * Note: This endpoint may need to be implemented in the backend
   */
  removeFavoriteSeller: async (sellerId: string): Promise<void> => {
    await apiClient.delete(`/api/customer/favorite-sellers/${sellerId}`);
  },

  /**
   * Get customer's active cart
   */
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>('/api/cart');
    return response.data;
  },

  /**
   * Get cart items
   */
  getCartItems: async (): Promise<CartItem[]> => {
    // This endpoint might need to be implemented in the backend
    // For now, we'll use the cart endpoint and extract items
    const response = await apiClient.get<Cart>('/api/cart');
    return response.data.items || [];
  },

  /**
   * Add item to cart
   */
  addToCart: async (foodItemId: string, quantity: number): Promise<CartItem> => {
    const response = await apiClient.post<CartItem>('/api/cart/items', {
      foodItemId,
      quantity
    });
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (cartItemId: string, quantity: number): Promise<CartItem> => {
    const response = await apiClient.put<CartItem>(`/api/cart/items/${cartItemId}`, {
      quantity
    });
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (cartItemId: string): Promise<void> => {
    await apiClient.delete(`/api/cart/items/${cartItemId}`);
  },

  /**
   * Checkout cart
   * Note: This endpoint may need to be implemented in the backend
   */
  checkout: async (
    deliveryAddress: string, 
    specialInstructions?: string
  ): Promise<Order> => {
    // This might need to be implemented as a cart status update in the backend
    const response = await apiClient.post<Order>(`/api/cart/checkout`, {
      deliveryAddress,
      specialInstructions
    });
    return response.data;
  },

  /**
   * Get customer orders
   */
  getOrders: async (): Promise<Order[]> => {
    // Updated to match the backend route
    const response = await apiClient.get<Order[]>('/api/customer/orders');
    return response.data;
  },

  /**
   * Get order details
   */
  getOrderDetails: async (orderId: string): Promise<Order> => {
    // Updated to match the backend route
    const response = await apiClient.get<Order>(`/api/customer/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get customer dashboard stats
   */
  getDashboardStats: async (): Promise<any> => {
    const response = await apiClient.get<any>('/api/customer/dashboard');
    return response.data;
  }
}; 