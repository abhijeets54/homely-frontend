'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { useCart, useCreateOrder, useCreatePaymentIntent } from '@/lib/api';
import { CartItem } from '@/lib/types/models';
import { PaymentMethod } from '@/lib/types/payment';
import { ArrowLeft, CreditCard, Banknote, Wallet } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Form state
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Cart query
  const { 
    data: cart, 
    isLoading: cartLoading, 
    error: cartError 
  } = useCart(user?.id || '');
  
  // Order and payment mutations
  const createOrder = useCreateOrder();
  const createPaymentIntent = useCreatePaymentIntent();

  // Calculate subtotal
  const calculateSubtotal = (items: CartItem[] = []) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate delivery fee
  const deliveryFee = 50;

  // Calculate total
  const calculateTotal = (items: CartItem[] = []) => {
    return calculateSubtotal(items) + deliveryFee;
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!user?.id || !cart) return;
    
    if (!deliveryAddress.trim()) {
      toast({
        title: "Delivery Address Required",
        description: "Please enter a delivery address to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create order
      const orderData = {
        restaurantId: cart.items?.[0]?.foodItem?.restaurantId || '',
        userId: user.id,
        deliveryAddress,
        specialInstructions: specialInstructions.trim() || undefined,
        totalPrice: calculateTotal(cart.items),
        paymentStatus: 'pending',
        status: 'pending'
      };
      
      const order = await createOrder.mutateAsync(orderData);
      
      // Create payment intent
      if (order) {
        const paymentData = {
          orderId: order.id,
          amount: order.totalPrice,
          paymentMethod
        };
        
        const payment = await createPaymentIntent.mutateAsync(paymentData);
        
        toast({
          title: "Order Placed Successfully",
          description: "Your order has been placed and is being processed.",
        });
        
        // Redirect based on payment method
        if (paymentMethod === 'cod') {
          router.push(`/customer/orders/${order.id}`);
        } else {
          router.push(`/checkout/payment/${payment.id}`);
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: `Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if cart is empty or not in checkout status
  const isCartInvalid = !cart || !cart.items || cart.items.length === 0 || cart.status !== 'checkout';

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to access the checkout page.</p>
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
          <Link href="/cart" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        {cartLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : cartError ? (
          <Card className="p-6 text-center">
            <CardTitle className="text-red-500 mb-2">Error Loading Checkout</CardTitle>
            <CardDescription>
              We encountered an error while loading your checkout information. Please try again later.
            </CardDescription>
            <Button className="mt-4" onClick={() => router.push('/cart')}>
              Return to Cart
            </Button>
          </Card>
        ) : isCartInvalid ? (
          <Card className="p-6 text-center">
            <CardTitle className="mb-2">Invalid Checkout</CardTitle>
            <CardDescription className="mb-6">
              Your cart is either empty or not ready for checkout. Please add items to your cart first.
            </CardDescription>
            <Button asChild>
              <Link href="/restaurants">Browse Restaurants</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {/* Delivery Information */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                  <CardDescription>
                    Enter your delivery address and any special instructions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                    <Textarea
                      id="deliveryAddress"
                      placeholder="Enter your full delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="mt-1"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="specialInstructions"
                      placeholder="Any special instructions for delivery or food preparation"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Select your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-4">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center cursor-pointer">
                        <Banknote className="h-5 w-5 mr-2 text-green-600" />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-gray-500">Pay with cash when your order arrives</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-4">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex items-center cursor-pointer">
                        <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-gray-500">Pay securely with your card</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-4">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center cursor-pointer">
                        <Wallet className="h-5 w-5 mr-2 text-purple-600" />
                        <div>
                          <p className="font-medium">UPI</p>
                          <p className="text-sm text-gray-500">Pay using UPI apps like Google Pay, PhonePe, etc.</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                    {cart.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="font-medium">{item.quantity} x</div>
                          <div className="ml-2">
                            <div className="font-medium">{item.foodItem?.name}</div>
                            <div className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</div>
                          </div>
                        </div>
                        <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{calculateSubtotal(cart.items).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
                      <span>Total</span>
                      <span>₹{calculateTotal(cart.items).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || !deliveryAddress.trim()}
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 