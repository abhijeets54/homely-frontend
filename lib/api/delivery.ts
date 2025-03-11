import { DeliveryAssignment, DeliveryPartner, Order } from '../types/models';
import { client } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Delivery API service
export const deliveryApi = {
  // Get delivery partner profile
  async getProfile(): Promise<DeliveryPartner> {
    try {
      const response = await client.get('/api/delivery/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery partner profile:', error);
      throw error;
    }
  },

  // Update delivery partner profile
  async updateProfile(data: Partial<DeliveryPartner>): Promise<DeliveryPartner> {
    try {
      const response = await client.put('/api/delivery/profile', data);
      return response.data;
    } catch (error) {
      console.error('Error updating delivery partner profile:', error);
      throw error;
    }
  },

  // Get available orders for delivery
  async getAvailableOrders(): Promise<Order[]> {
    try {
      const response = await client.get('/api/delivery/available-orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching available orders:', error);
      throw error;
    }
  },

  // Accept a delivery
  async acceptDelivery(orderId: string): Promise<DeliveryAssignment> {
    try {
      const response = await client.post(`/api/delivery/accept/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error accepting delivery:', error);
      throw error;
    }
  },

  // Get active deliveries
  async getActiveDeliveries(): Promise<DeliveryAssignment[]> {
    try {
      const response = await client.get('/api/delivery/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active deliveries:', error);
      throw error;
    }
  },

  // Update delivery status
  async updateDeliveryStatus(deliveryId: string, status: string): Promise<DeliveryAssignment> {
    try {
      const response = await client.put(`/api/delivery/status/${deliveryId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  },

  // Get delivery history
  async getDeliveryHistory(): Promise<DeliveryAssignment[]> {
    try {
      const response = await client.get('/api/delivery/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery history:', error);
      throw error;
    }
  },

  // Get delivery earnings
  async getEarnings(): Promise<{ total: number; today: number; weekly: number; monthly: number }> {
    try {
      const response = await client.get('/api/delivery/earnings');
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery earnings:', error);
      throw error;
    }
  },

  // Update vehicle information
  async updateVehicle(vehicleType: string): Promise<DeliveryPartner> {
    try {
      const response = await client.put('/api/delivery/vehicle', { vehicleType });
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle information:', error);
      throw error;
    }
  },

  // Update availability status
  async updateAvailability(isAvailable: boolean): Promise<DeliveryPartner> {
    try {
      const response = await client.put('/api/delivery/availability', { isAvailable });
      return response.data;
    } catch (error) {
      console.error('Error updating availability status:', error);
      throw error;
    }
  }
}; 