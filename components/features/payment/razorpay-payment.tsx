'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { formatPrice } from '@/lib/utils';
import { useRazorpay } from '@/lib/hooks/use-razorpay';
import { useAuth } from '@/lib/hooks/use-auth';

interface RazorpayPaymentProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function RazorpayPayment({
  amount,
  onSuccess,
  onError,
}: RazorpayPaymentProps) {
  const { user } = useAuth();
  const { initializePayment, isLoading, error } = useRazorpay({ amount });

  const handlePayment = async () => {
    if (!user) return;

    await initializePayment({
      customerName: user.name,
      email: user.email,
      phone: user.phoneNumber,
      address: user.address,
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Payment Details</h2>
          <p className="text-sm text-muted-foreground">
            Total amount: {formatPrice(amount)}
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Icons.credit className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Secure Payment via Razorpay</p>
                  <p className="text-sm text-muted-foreground">
                    Pay using Credit/Debit Card, UPI, or Net Banking
                  </p>
                </div>
              </div>
              <img
                src="/razorpay-logo.png"
                alt="Razorpay"
                className="h-8"
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay {formatPrice(amount)}</>
            )}
          </Button>
        </div>

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
      </div>
    </Card>
  );
} 