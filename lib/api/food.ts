import { Category, FoodItem, Seller } from '../types/models';
import apiClient from './client';

export const foodApi = {
  /**
   * Get all sellers
   */
  getSellers: async (): Promise<Seller[]> => {
    try {
      const response = await apiClient.get<Seller[]>('/api/seller');
      
      // Enhanced logging to debug seller data structure
      console.log('Fetched sellers data structure:', {
        count: response.data.length,
        firstSeller: response.data[0] ? {
          id: response.data[0].id,
          _id: response.data[0]._id,
          name: response.data[0].name,
          keys: Object.keys(response.data[0])
        } : 'No sellers found'
      });
      
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
    // Enhanced validation for sellerId
    if (!sellerId || sellerId === 'undefined' || sellerId === 'null') {
      const errorMessage = 'Invalid seller ID provided';
      console.error(errorMessage, { sellerId });
      throw new Error(errorMessage);
    }

    try {
      console.log(`Fetching seller with ID: ${sellerId}`);
      const response = await apiClient.get<Seller>(`/api/seller/${sellerId}`);
      
      // Validate response data
      if (!response.data) {
        throw new Error('No seller data returned from API');
      }
      
      return response.data;
    } catch (error: any) {
      // Provide more detailed error information
      const statusCode = error.response?.status;
      const responseData = error.response?.data;
      
      console.error('Error fetching seller:', { 
        sellerId,
        statusCode,
        responseData,
        message: error.message
      });
      
      if (statusCode === 404) {
        throw new Error('Seller not found');
      }
      
      throw new Error(`Error fetching seller data: ${error.message}`);
    }
  },

  /**
   * Get categories by seller ID
   */
  getCategoriesBySeller: async (sellerId: string): Promise<Category[]> => {
    // Add validation for sellerId
    if (!sellerId || sellerId === 'undefined' || sellerId === 'null') {
      console.error('Invalid seller ID for fetching categories', { sellerId });
      return [];
    }
    
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
    // Add validation for sellerId
    if (!sellerId || sellerId === 'undefined' || sellerId === 'null') {
      console.error('Invalid seller ID for fetching food items', { sellerId });
      return [];
    }
    
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
      // Map _id to id for consistency
      return response.data.map(item => ({
        ...item,
        id: item._id || item.id,
        categoryId: typeof item.categoryId === 'object' && item.categoryId?._id ? item.categoryId._id : item.categoryId,
        restaurantId: typeof item.restaurantId === 'object' && item.restaurantId?._id ? item.restaurantId._id : item.restaurantId
      }));
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