import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Payment } from '../types/models';
import { PaymentIntentRequest, PaymentProcessRequest, RefundRequest } from '../types/payment';
import { client } from './client';

// Payment API service
export const paymentApi = {
  // Create a payment intent
  async createPaymentIntent(data: PaymentIntentRequest): Promise<Payment> {
    try {
      const response = await client.post('/api/payment/intent', data);
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Process payment
  async processPayment(data: PaymentProcessRequest): Promise<Payment> {
    try {
      const response = await client.post(`/api/payment/process/${data.paymentId}`, data.paymentDetails);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Get payment by ID
  async getPaymentById(paymentId: string): Promise<Payment> {
    try {
      const response = await client.get(`/api/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  // Get payment by order ID
  async getPaymentByOrder(orderId: string): Promise<Payment> {
    try {
      const response = await client.get(`/api/payment/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment by order:', error);
      throw error;
    }
  },

  // Get payments for a customer
  async getCustomerPayments(): Promise<Payment[]> {
    try {
      const response = await client.get(`/api/payment/customer`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      throw error;
    }
  },

  // Get payments for a seller
  async getSellerPayments(): Promise<Payment[]> {
    try {
      const response = await client.get(`/api/payment/seller`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seller payments:', error);
      throw error;
    }
  },

  // Request refund
  async requestRefund(data: RefundRequest): Promise<Payment> {
    try {
      const response = await client.post(`/api/payment/refund/request/${data.paymentId}`, {
        amount: data.amount,
        reason: data.reason
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw error;
    }
  },

  // Process refund (for sellers/admins)
  async processRefund(paymentId: string, status: 'processed' | 'rejected', notes?: string): Promise<Payment> {
    try {
      const response = await client.put(`/api/payment/refund/process/${paymentId}`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  },

  // Get payment analytics for sellers
  async getPaymentAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<any> {
    try {
      const response = await client.get(`/api/payment/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      throw error;
    }
  }
};

// Custom hooks for payments
export const usePayment = (paymentId: string) => {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentApi.getPaymentById(paymentId),
    enabled: !!paymentId,
  });
};

export const usePaymentByOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['payment', 'order', orderId],
    queryFn: () => paymentApi.getPaymentByOrder(orderId),
    enabled: !!orderId,
  });
};

export const useCustomerPayments = () => {
  return useQuery({
    queryKey: ['payments', 'customer'],
    queryFn: () => paymentApi.getCustomerPayments(),
  });
};

export const useSellerPayments = () => {
  return useQuery({
    queryKey: ['payments', 'seller'],
    queryFn: () => paymentApi.getSellerPayments(),
  });
};

export const useCreatePaymentIntent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PaymentIntentRequest) => paymentApi.createPaymentIntent(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payment', 'order', data.orderId] });
    },
  });
};

export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PaymentProcessRequest) => paymentApi.processPayment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payment', 'order', data.orderId] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'customer'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'seller'] });
    },
  });
};

export const useRequestRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RefundRequest) => paymentApi.requestRefund(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payment', 'order', data.orderId] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'customer'] });
    },
  });
};

export const useProcessRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ paymentId, status, notes }: { paymentId: string; status: 'processed' | 'rejected'; notes?: string }) => 
      paymentApi.processRefund(paymentId, status, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payment', 'order', data.orderId] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'customer'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'seller'] });
    },
  });
};

export const usePaymentAnalytics = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
  return useQuery({
    queryKey: ['payment', 'analytics', period],
    queryFn: () => paymentApi.getPaymentAnalytics(period),
  });
}; 