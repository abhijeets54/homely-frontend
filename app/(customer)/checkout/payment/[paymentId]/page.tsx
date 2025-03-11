'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { paymentApi } from '@/lib/api/payment';
import { ArrowLeft, CreditCard, Wallet, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PaymentPage({ params }: { params: { paymentId: string } }) {
  const { paymentId } = params;
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // State for payment details
  const [paymentTab, setPaymentTab] = useState<'card' | 'upi'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Payment query
  const { 
    data: payment, 
    isLoading: paymentLoading, 
    error: fetchError,
    refetch: refetchPayment
  } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      try {
        const response = await paymentApi.getPaymentById(paymentId);
        return response;
      } catch (error) {
        console.error('Error fetching payment:', error);
        throw error;
      }
    },
    enabled: !!paymentId && isAuthenticated,
  });

  // Check if payment is already completed
  useEffect(() => {
    if (payment && payment.paymentStatus === 'paid') {
      setIsPaymentComplete(true);
    }
  }, [payment]);

  // Handle card payment
  const handleCardPayment = async () => {
    if (!validateCardDetails()) return;
    
    await processPaymentRequest({
      cardNumber,
      cardExpiry,
      cardCvv,
      cardHolderName
    });
  };

  // Handle UPI payment
  const handleUpiPayment = async () => {
    if (!validateUpiDetails()) return;
    
    await processPaymentRequest({
      upiId,
      upiTransactionId: `UPI${Date.now()}`
    });
  };

  // Process payment request
  const processPaymentRequest = async (paymentDetails: any) => {
    if (!paymentId) return;
    
    setIsSubmitting(true);
    setPaymentError(null);
    
    try {
      await paymentApi.processPayment({
        paymentId,
        paymentDetails
      });
      
      setIsPaymentComplete(true);
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
      
      // Refetch payment to get updated status
      await refetchPayment();
      
      // Redirect to order page after 3 seconds
      setTimeout(() => {
        router.push(`/customer/orders/${payment?.orderId}`);
      }, 3000);
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentError(error instanceof Error ? error.message : 'Failed to process payment. Please try again.');
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Failed to process payment. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate card details
  const validateCardDetails = () => {
    if (!cardNumber.trim()) {
      toast({
        title: "Card Number Required",
        description: "Please enter your card number.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!cardExpiry.trim()) {
      toast({
        title: "Card Expiry Required",
        description: "Please enter your card expiry date.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!cardCvv.trim()) {
      toast({
        title: "CVV Required",
        description: "Please enter your card CVV.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!cardHolderName.trim()) {
      toast({
        title: "Card Holder Name Required",
        description: "Please enter the card holder name.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // Validate UPI details
  const validateUpiDetails = () => {
    if (!upiId.trim()) {
      toast({
        title: "UPI ID Required",
        description: "Please enter your UPI ID.",
        variant: "destructive",
      });
      return false;
    }
    
    // Basic UPI ID validation
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    if (!upiRegex.test(upiId.trim())) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID (e.g., username@upi).",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format card expiry
  const formatCardExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to access the payment page.</p>
            <Button asChild>
              <Link href="/login?userType=customer">Login</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/checkout" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Checkout</span>
          </Link>
          <h1 className="text-3xl font-bold">Payment</h1>
        </div>

        {paymentLoading ? (
          <div className="max-w-md mx-auto">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : fetchError ? (
          <Card className="max-w-md mx-auto p-6 text-center">
            <CardTitle className="text-red-500 mb-2">Error Loading Payment</CardTitle>
            <CardDescription>
              We encountered an error while loading your payment information. Please try again later.
            </CardDescription>
            <Button className="mt-4" onClick={() => refetchPayment()}>
              Retry
            </Button>
            <Button className="mt-4 ml-2" onClick={() => router.push('/checkout')}>
              Return to Checkout
            </Button>
          </Card>
        ) : !payment ? (
          <Card className="max-w-md mx-auto p-6 text-center">
            <CardTitle className="mb-2">Payment Not Found</CardTitle>
            <CardDescription className="mb-6">
              The payment you're looking for doesn't exist or has been removed.
            </CardDescription>
            <Button asChild>
              <Link href="/checkout">Return to Checkout</Link>
            </Button>
          </Card>
        ) : isPaymentComplete ? (
          <Card className="max-w-md mx-auto p-6 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <CardTitle className="text-green-600 mb-2">Payment Successful</CardTitle>
            <CardDescription className="mb-6">
              Your payment of ₹{payment.amount.toFixed(2)} has been processed successfully. You will be redirected to your order page shortly.
            </CardDescription>
            <Button asChild>
              <Link href={`/customer/orders/${payment.orderId}`}>View Order</Link>
            </Button>
          </Card>
        ) : (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Payment</CardTitle>
                <CardDescription>
                  Order Total: ₹{payment.amount.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <p className="text-sm text-red-700">{paymentError}</p>
                  </div>
                )}
                
                {payment.paymentMethod === 'online' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                          maxLength={5}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          maxLength={3}
                          disabled={isSubmitting}
                          type="password"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardHolderName">Card Holder Name</Label>
                      <Input
                        id="cardHolderName"
                        placeholder="John Doe"
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                ) : payment.paymentMethod === 'upi' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600">
                        After clicking "Pay Now", you will need to complete the payment in your UPI app.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Invalid payment method. Please return to checkout and select a valid payment method.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={payment.paymentMethod === 'online' ? handleCardPayment : handleUpiPayment}
                  disabled={isSubmitting || !['online', 'upi'].includes(payment.paymentMethod)}
                >
                  {isSubmitting ? 'Processing...' : 'Pay Now'}
                </Button>
              </CardFooter>
            </Card>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                This is a simulated payment page. No actual payment will be processed.
              </p>
              <p className="text-sm text-gray-500">
                In a production environment, this would integrate with a secure payment gateway.
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 