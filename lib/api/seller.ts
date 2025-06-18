import { Category, FoodItem, Order, Seller } from '../types/models';
import apiClient from './client';
import { formatImageUrlForBackend } from '@/lib/utils/image';

export const sellerApi = {
  /**
   * Get seller profile
   */
  getProfile: async (): Promise<Seller> => {
    try {
      const response = await apiClient.get<Seller>('/api/seller/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      throw error;
    }
  },

  /**
   * Update seller profile
   */
  updateProfile: async (data: any): Promise<Seller> => {
    try {
      console.log('Seller API - updateProfile called with data:', data);
      
      // Ensure the data object is properly structured before sending to backend
      const formattedData: Record<string, any> = { ...data };
      
      // Convert minimumOrder and deliveryRadius to numbers if they exist
      if (formattedData.minimumOrder !== undefined) {
        formattedData.minimumOrder = Number(formattedData.minimumOrder);
      }
      
      if (formattedData.deliveryRadius !== undefined) {
        formattedData.deliveryRadius = Number(formattedData.deliveryRadius);
      }
      
      console.log('Seller API - formatted data for backend:', formattedData);
      
      const response = await apiClient.put<Seller>('/api/seller/profile', formattedData);
      console.log('Seller API - update response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating seller profile:', error);
      throw error;
    }
  },

  /**
   * Update seller status (open/closed)
   */
  updateStatus: async (status: { status: 'open' | 'closed' }): Promise<Seller> => {
    try {
      const response = await apiClient.put<Seller>('/api/seller/status', status);
      return response.data;
    } catch (error) {
      console.error('Error updating seller status:', error);
      throw error;
    }
  },

  /**
   * Get all categories for a seller
   */
  getCategories: async (sellerId: string): Promise<Category[]> => {
    try {
      const response = await apiClient.get<Category[]>(`/api/category/seller/${sellerId}`);
  
      return response.data.map((cat) => ({
        ...cat,
        id: (cat as any)._id, // Map _id to id
      }));
    } catch (error) {
      console.error('Error fetching seller categories:', error);
      return [];
    }
  },
  
  //Get Category by ID
  getCategoryById: async (categoryId: string): Promise<Category> => {
    try {
      const response = await apiClient.get<Category>(`/api/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  },

  /**
   * Create a new category
   */
  createCategory: async (data: { name: string }): Promise<Category> => {
    try {
      const response = await apiClient.post<Category>('/api/category', data);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  /**
   * Update a category
   */
  updateCategory: async (categoryId: string, data: { name: string }): Promise<Category> => {
    try {
      const response = await apiClient.put<Category>(`/api/category/${categoryId}`, { name: data.name });
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  /**
   * Delete a category
   */
  deleteCategory: async (categoryId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/category/${categoryId}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  /**
   * Get all food items for a seller
   */
  getFoodItems: async (sellerId: string): Promise<FoodItem[]> => {
    if (!sellerId) {
      console.error('Seller ID is missing!');
      return [];
    }
    try {
      const response = await apiClient.get<FoodItem[]>(`/api/food/seller/${sellerId}`);
      // Map _id to id for food items
      return response.data.map((item) => ({
        ...item,
        id: (item as any)._id,
      }));
    } catch (error) {
      console.error('Error fetching seller food items:', error);
      return [];
    }
  },

  /**
   * Get food items by category
   */
  getFoodItemsByCategory: async (categoryId: string): Promise<FoodItem[]> => {
    try {
      const response = await apiClient.get<FoodItem[]>(`/api/food/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching food items by category:', error);
      return [];
    }
  },

  /**
   * Create a new food item
   */
  createFoodItem: async (foodItem: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FoodItem> => {
    try {
      const response = await apiClient.post<FoodItem>('/api/food', foodItem);
      return response.data;
    } catch (error) {
      console.error('Error creating food item:', error);
      throw error;
    }
  },

  /**
   * Update a food item
   */
  updateFoodItem: async (foodItemId: string, data: Partial<FoodItem>): Promise<FoodItem> => {
    try {
      const response = await apiClient.put<FoodItem>(`/api/food/${foodItemId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating food item:', error);
      throw error;
    }
  },

  /**
   * Delete a food item
   */
  deleteFoodItem: async (foodItemId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/food/${foodItemId}`);
    } catch (error) {
      console.error('Error deleting food item:', error);
      throw error;
    }
  },

  /**
   * Get all orders for a seller
   */
  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await apiClient.get<Order[]>('/api/seller', { params: { view: 'orders' } });
      return response.data;
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      return [];
    }
  },

  /**
   * Get order details
   */
  getOrderDetails: async (orderId: string): Promise<Order> => {
    try {
      const response = await apiClient.get<Order>(`/api/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order details for ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (
    orderId: string, 
    status: { status: 'pending' | 'preparing' | 'out for delivery' | 'delivered' }
  ): Promise<Order> => {
    try {
      const response = await apiClient.put<Order>(`/api/seller/orders/${orderId}/status`, status);
      return response.data;
    } catch (error) {
      console.error(`Error updating order status for ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Get all sellers
   */
  getAllSellers: async (): Promise<Seller[]> => {
    try {
      const response = await apiClient.get<Seller[]>('/api/seller');
      return response.data;
    } catch (error) {
      console.error('Error fetching all sellers:', error);
      return [];
    }
  },

  /**
   * Get seller dashboard stats
   */
  getDashboardStats: async (): Promise<any> => {
    try {
      // WORKAROUND: Using query parameter instead of path segment to avoid MongoDB ObjectId casting error
      // Original endpoint '/api/seller/dashboard' causes "Cast to ObjectId failed for value 'dashboard'" error
      // because the backend tries to interpret 'dashboard' as a MongoDB ObjectId
      const response = await apiClient.get<any>('/api/seller', { params: { view: 'dashboard' } });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return error message about missing backend implementation
      throw new Error("Seller dashboard API is not properly implemented in the backend. The endpoint is returning a 500 error. Please check miss.md for details.");
    }
  },

  /**
   * Get seller menu (categories and food items)
   */
  getMenu: async (sellerId: string): Promise<any> => {
    try {
      const response = await apiClient.get<any>(`/api/seller/${sellerId}/menu`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching menu for seller ${sellerId}:`, error);
      return { categories: [], items: [] };
    }
  },

  /**
   * Get menu items for seller
   */
  getMenuItems: async (sellerId: string): Promise<FoodItem[]> => {
    if (!sellerId) {
      console.error('Seller ID is missing!');
      return [];
    }
    try {
      const response = await apiClient.get<FoodItem[]>(`/api/food/${sellerId}/menu`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching menu items:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Update menu item
   */
  updateMenuItem: async (itemId: string, data: Partial<FoodItem>): Promise<FoodItem> => {
    try {
      // Format imageUrl if provided
      if (data.imageUrl) {
        data.imageUrl = formatImageUrlForBackend(data.imageUrl);
      }
      
      const response = await apiClient.put<FoodItem>(`/api/food/${itemId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating menu item ${itemId}:`, error);
      throw error;
    }
  },
  /* Update menu item availability
  */
 updateMenuItemAvailability: async (itemId: string, isAvailable: boolean): Promise<FoodItem> => {
   try {
     const response = await apiClient.put<FoodItem>(`/api/food/${itemId}/availability`, { isAvailable });
     return response.data;
   } catch (error) {
     console.error(`Error updating menu item availability ${itemId}:`, error);
     throw error;
   }
 },

  /**
   * Delete menu item
   */
  deleteMenuItem: async (itemId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/food/${itemId}`);
    } catch (error) {
      console.error(`Error deleting menu item ${itemId}:`, error);
      throw error;
    }
  }
};
