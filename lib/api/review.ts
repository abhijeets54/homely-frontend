import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Review } from '../types/models';
import { client } from './client';

// Review API service
export const reviewApi = {
  // Get reviews for a restaurant
  async getRestaurantReviews(restaurantId: string): Promise<Review[]> {
    try {
      const response = await client.get(`/api/review/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant reviews:', error);
      throw error;
    }
  },

  // Get reviews for a food item
  async getFoodItemReviews(foodItemId: string): Promise<Review[]> {
    try {
      const response = await client.get(`/api/review/food/${foodItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching food item reviews:', error);
      throw error;
    }
  },

  // Get reviews by a customer
  async getCustomerReviews(): Promise<Review[]> {
    try {
      // Updated to match the backend route - uses auth token to identify customer
      const response = await client.get(`/api/review/customer`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer reviews:', error);
      throw error;
    }
  },

  // Create a review
  async createReview(reviewData: Partial<Review>): Promise<Review> {
    try {
      const response = await client.post('/api/review', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Update a review
  async updateReview(reviewId: string, reviewData: Partial<Review>): Promise<Review> {
    try {
      const response = await client.put(`/api/review/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      await client.delete(`/api/review/${reviewId}`);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Get a specific review
  async getReview(reviewId: string): Promise<Review> {
    try {
      const response = await client.get(`/api/review/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
  },

  // Get reviews for an order
  async getOrderReviews(orderId: string): Promise<Review[]> {
    try {
      const response = await client.get(`/api/review/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order reviews:', error);
      throw error;
    }
  }
};

// Custom hooks for reviews
export const useRestaurantReviews = (restaurantId: string) => {
  return useQuery({
    queryKey: ['reviews', 'restaurant', restaurantId],
    queryFn: () => reviewApi.getRestaurantReviews(restaurantId),
    enabled: !!restaurantId,
  });
};

export const useFoodItemReviews = (foodItemId: string) => {
  return useQuery({
    queryKey: ['reviews', 'food', foodItemId],
    queryFn: () => reviewApi.getFoodItemReviews(foodItemId),
    enabled: !!foodItemId,
  });
};

export const useCustomerReviews = () => {
  return useQuery({
    queryKey: ['reviews', 'customer'],
    queryFn: () => reviewApi.getCustomerReviews(),
  });
};

export const useOrderReviews = (orderId: string) => {
  return useQuery({
    queryKey: ['reviews', 'order', orderId],
    queryFn: () => reviewApi.getOrderReviews(orderId),
    enabled: !!orderId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewData: Partial<Review>) => reviewApi.createReview(reviewData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      if (data.restaurantId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'restaurant', data.restaurantId] });
      }
      
      if (data.foodItemId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'food', data.foodItemId] });
      }
      
      if (data.orderId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'order', data.orderId] });
      }
      
      queryClient.invalidateQueries({ queryKey: ['reviews', 'customer'] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, reviewData }: { reviewId: string; reviewData: Partial<Review> }) => 
      reviewApi.updateReview(reviewId, reviewData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews', data.id] });
      
      if (data.restaurantId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'restaurant', data.restaurantId] });
      }
      
      if (data.foodItemId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'food', data.foodItemId] });
      }
      
      if (data.orderId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'order', data.orderId] });
      }
      
      queryClient.invalidateQueries({ queryKey: ['reviews', 'customer'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewId: string) => reviewApi.deleteReview(reviewId),
    onSuccess: (_, reviewId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'customer'] });
    },
  });
}; 