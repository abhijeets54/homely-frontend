import { Category, FoodItem, Seller } from '../types/models';
import apiClient from './client';

export const foodApi = {
  /**
   * Get all sellers
   */
  getSellers: async (): Promise<Seller[]> => {
    try {
      const response = await apiClient.get<Seller[]>('/api/seller');
      console.log('Fetched sellers:', response.data); // Log the response data
      return response.data;
    } catch (error) {
      console.error('Error fetching sellers:', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  /**
   * Get seller by ID
   */
  getSellerById: async (sellerId: string): Promise<Seller> => {
    if (!sellerId) {
      console.error('Seller ID is undefined');
      throw new Error('Seller ID is required');
    }

    try {
      const response = await apiClient.get(`http://localhost:5000/api/seller/${sellerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seller:', error);
      throw new Error('Error fetching seller data');
    }
  },

  /**
   * Get categories by seller ID
   */
  getCategoriesBySeller: async (sellerId: string): Promise<Category[]> => {
    try {
      const response = await apiClient.get<Category[]>(`/api/category/seller/${sellerId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching categories for seller ${sellerId}:`, error);
      return [];
    }
  },

  /**
   * Get food items by seller ID
   */
  getFoodItemsBySeller: async (sellerId: string): Promise<FoodItem[]> => {
    try {
      // WORKAROUND: Using query parameter instead of path segment to avoid MongoDB ObjectId casting error
      // Original endpoint '/api/food/seller/${sellerId}' causes "Cast to ObjectId failed for value 'seller'" error
      // when sellerId is not provided, because the backend tries to interpret 'seller' as a MongoDB ObjectId
      const response = await apiClient.get<FoodItem[]>('/api/food', { params: { sellerId } });
      return response.data;
    } catch (error) {
      console.error(`Error fetching food items for seller ${sellerId}:`, error);
      return [];
    }
  },

  /**
   * Get food items by category ID
   */
  getFoodItemsByCategory: async (categoryId: string): Promise<FoodItem[]> => {
    try {
      const response = await apiClient.get<FoodItem[]>(`/api/food/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching food items for category ${categoryId}:`, error);
      return [];
    }
  },

  /**
   * Get food item by ID
   */
  getFoodItemById: async (foodItemId: string): Promise<FoodItem> => {
    try {
      const response = await apiClient.get<FoodItem>(`/api/food/${foodItemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching food item ${foodItemId}:`, error);
      throw error;
    }
  },

  /**
   * Search food items
   */
  searchFoodItems: async (query: string): Promise<FoodItem[]> => {
    try {
      const response = await apiClient.get<FoodItem[]>(`/api/food/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching food items with query "${query}":`, error);
      return [];
    }
  },

  /**
   * Get seller menu (categories and food items)
   */
  getSellerMenu: async (sellerId: string): Promise<any> => {
    try {
      const response = await apiClient.get<any>(`/api/seller/${sellerId}/menu`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching menu for seller ${sellerId}:`, error);
      return { categories: [], items: [] };
    }
  }
}; 