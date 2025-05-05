// Debug version of cart API to diagnose issues with Add to Cart functionality
import { client } from './client';

export const debugCartApi = {
  // Debug function to test adding an item to cart
  async debugAddToCart(foodItemId: string, quantity: number): Promise<any> {
    try {
      console.log('Debug Add to Cart - Starting with params:', { foodItemId, quantity });
      
      // Check if token exists
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      console.log('Debug Add to Cart - Token exists:', !!token);
      
      if (!token) {
        console.error('Debug Add to Cart - No token available');
        throw new Error('Authentication required. Please login to add items to cart.');
      }
      
      // Log the request details
      console.log('Debug Add to Cart - Making request to /api/cart/items with:', {
        foodItemId,
        quantity,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.substring(0, 10)}...` // Only log part of the token for security
        }
      });
      
      // Make the request with detailed error handling
      try {
        const response = await client.post('/api/cart/items', {
          foodItemId,
          quantity
        });
        
        console.log('Debug Add to Cart - Response status:', response.status);
        console.log('Debug Add to Cart - Response data:', response.data);
        
        return response.data;
      } catch (requestError: any) {
        console.error('Debug Add to Cart - Request failed:', {
          status: requestError.response?.status,
          statusText: requestError.response?.statusText,
          data: requestError.response?.data,
          message: requestError.message
        });
        
        if (requestError.response?.status === 401) {
          console.error('Debug Add to Cart - Authentication error. Token might be invalid or expired.');
        } else if (requestError.response?.status === 403) {
          console.error('Debug Add to Cart - Authorization error. User might not have customer role.');
        } else if (requestError.response?.status === 404) {
          console.error('Debug Add to Cart - API endpoint not found. Check route configuration.');
        } else if (requestError.response?.status === 400) {
          console.error('Debug Add to Cart - Bad request. Check payload format.');
        }
        
        throw requestError;
      }
    } catch (error) {
      console.error('Debug Add to Cart - Overall error:', error);
      throw error;
    }
  }
};
