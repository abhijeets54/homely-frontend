'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode, useEffect, useState } from 'react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}

interface UseStripePaymentProps {
  amount: number;
  currency?: string;
}

export function useStripePayment({ amount, currency = 'usd' }: UseStripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsLoading(true);
        setError(undefined);

        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency }),
        });

        if (!response.ok) {
          throw new Error('Failed to initialize payment');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    if (amount > 0) {
      initializePayment();
    }
  }, [amount, currency]);

  const handlePayment = async (stripe: Stripe | null) => {
    if (!stripe || !clientSecret) {
      setError('Payment not initialized');
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);

      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      return paymentIntent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clientSecret,
    isLoading,
    error,
    handlePayment,
  };
} 