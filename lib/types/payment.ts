import { Payment } from './models';

// Payment method types
export type PaymentMethod = 'cod' | 'online' | 'upi';

// Payment status types
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Refund status types
export type RefundStatus = 'pending' | 'processed' | 'rejected';

// Payment intent request
export interface PaymentIntentRequest {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

// Payment process request
export interface PaymentProcessRequest {
  paymentId: string;
  paymentDetails: {
    // For COD
    confirmationCode?: string;
    
    // For online payment
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardHolderName?: string;
    
    // For UPI
    upiId?: string;
    upiTransactionId?: string;
  };
}

// Refund request
export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

// Refund process request
export interface RefundProcessRequest {
  paymentId: string;
  status: RefundStatus;
  notes?: string;
}

// Payment analytics response
export interface PaymentAnalytics {
  totalRevenue: number;
  periodRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  paymentMethodBreakdown: {
    cod: number;
    online: number;
    upi: number;
  };
  revenueByDay?: {
    date: string;
    revenue: number;
  }[];
  revenueByWeek?: {
    week: string;
    revenue: number;
  }[];
  revenueByMonth?: {
    month: string;
    revenue: number;
  }[];
}

// Payment response with additional details
export interface PaymentResponse extends Payment {
  paymentGatewayResponse?: any;
  refundHistory?: {
    amount: number;
    reason: string;
    status: RefundStatus;
    createdAt: string;
    processedAt?: string;
    processedBy?: string;
    notes?: string;
  }[];
} 