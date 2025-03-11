'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UseRazorpayProps {
  amount: number;
  currency?: string;
  orderId?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

export function useRazorpay({ amount, currency = 'INR' }: UseRazorpayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const { toast } = useToast();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializePayment = async (orderDetails: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    try {
      setIsLoading(true);
      setError(undefined);

      // Create order on your backend
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId } = await response.json();

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: amount * 100, // Razorpay expects amount in smallest currency unit
        currency,
        name: 'Homely',
        description: 'Food Order Payment',
        order_id: orderId,
        handler: function (response: any) {
          handlePaymentSuccess(response);
        },
        prefill: {
          name: orderDetails.customerName,
          email: orderDetails.email,
          contact: orderDetails.phone,
        },
        notes: {
          address: orderDetails.address,
        },
        theme: {
          color: '#8A2BE2', // Primary color from theme
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initialization failed');
      toast({
        title: 'Error',
        description: 'Failed to initialize payment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      // Verify payment on your backend
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      toast({
        title: 'Payment successful',
        description: 'Your order has been placed successfully!',
      });

      return true;
    } catch (err) {
      setError('Payment verification failed');
      toast({
        title: 'Error',
        description: 'Payment verification failed',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    initializePayment,
    isLoading,
    error,
  };
} 