'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';

interface PaymentFormProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve payment intent status
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          toast({
            title: 'Payment successful',
            description: 'Thank you for your payment!',
          });
          onSuccess?.();
          break;
        case 'processing':
          toast({
            title: 'Payment processing',
            description: 'Your payment is processing.',
          });
          break;
        case 'requires_payment_method':
          toast({
            title: 'Payment failed',
            description: 'Please try another payment method.',
            variant: 'destructive',
          });
          onError?.('Payment failed. Please try another payment method.');
          break;
        default:
          toast({
            title: 'Something went wrong',
            description: 'Please try again.',
            variant: 'destructive',
          });
          onError?.('Something went wrong. Please try again.');
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (error) {
        toast({
          title: 'Payment failed',
          description: error.message,
          variant: 'destructive',
        });
        onError?.(error.message);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      onError?.('An unexpected error occurred.');
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Payment Details</h2>
          <p className="text-sm text-muted-foreground">
            Total amount: {formatPrice(amount)}
          </p>
        </div>

        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={!stripe || !elements}
        >
          {!stripe || !elements ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>Pay {formatPrice(amount)}</>
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By clicking Pay, you agree to our{' '}
            <a href="/terms" className="underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </form>
    </Card>
  );
} 