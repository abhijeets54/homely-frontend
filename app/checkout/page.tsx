'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/components/providers/cart-provider';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/format';
import { useCreateOrderFromLocalCart } from '@/lib/api/orders';
import { useOrderMetricsStore } from '@/lib/store/orderMetricsStore';
import { Order } from '@/lib/types/models';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Get cart data safely with fallbacks
  const cartContext = useCart();
  const cartItems = cartContext?.cartItems || [];
  const totalPrice = cartContext?.totalPrice || 0;
  const clearCart = cartContext?.clearCart || (async () => {});
  
  // Also get the Zustand store as backup
  const cartStore = useCartStore();
  
  // Get the order metrics store to save order data
  const orderMetricsStore = useOrderMetricsStore();
  const addOrderToMetrics = useOrderMetricsStore(state => state.addOrder);
  
  const createOrderMutation = useCreateOrderFromLocalCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState(user?.address || '');
  const [instructions, setInstructions] = useState('');
  const [isPageReady, setIsPageReady] = useState(false);

  // Combined cart items for display (prefer context cart, fall back to Zustand)
  const displayItems = useMemo(() => {
    return cartItems.length > 0 ? cartItems : cartStore.items;
  }, [cartItems, cartStore.items]);
  
  // Combined total price (prefer context total, fall back to Zustand)
  const displayTotalPrice = useMemo(() => {
    return totalPrice > 0 ? totalPrice : cartStore.getTotal();
  }, [totalPrice, cartStore]);

  // Ensure hydration is complete before rendering
  useEffect(() => {
    // Make sure Zustand is hydrated
    if (typeof window !== 'undefined') {
      useCartStore.persist.rehydrate();
      setIsPageReady(true);
    }
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    // Check after page is ready to avoid hydration mismatch
    if (isPageReady && displayItems.length === 0) {
      toast.error('Your cart is empty');
      router.push('/');
    }
  }, [isPageReady, displayItems.length, router]);

  // Handle the checkout submission
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast.error('Please provide a delivery address');
      return;
    }
    
    // For demo purposes, simplified authentication check
    // In a real app, you would require authentication
    let userId = user ? (user as any).id : null;
    if (!isAuthenticated || !user) {
      // For demo, create a guest order
      userId = 'guest-user';
    }
    
    try {
      setIsSubmitting(true);
      
      // Get food items from cart
      const itemsToOrder = displayItems.map(item => {
        const foodItemName = item.foodItem && typeof item.foodItem === 'object' 
          ? (item.foodItem as any).name || 'Food Item'
          : 'Food Item';
          
        const restaurantId = item.foodItem && typeof item.foodItem === 'object'
          ? (item.foodItem as any).restaurantId || 'default-restaurant'
          : 'default-restaurant';
          
        return {
          foodItemId: item.foodItemId || (item.foodItem && typeof item.foodItem === 'object' ? (item.foodItem as any).id : ''),
          quantity: item.quantity,
          price: item.price,
          name: foodItemName,
          restaurantId: restaurantId
        };
      });
      
      if (itemsToOrder.length === 0) {
        toast.error('Your cart is empty');
        router.push('/');
        return;
      }
      
      // Prepare order data
      const orderData = {
        userId: userId,
        items: itemsToOrder,
        deliveryAddress: address,
        specialInstructions: instructions,
        status: 'pending' as 'pending' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled',
        total: displayTotalPrice + 50, // Including delivery fee (API expects 'total')
        createdAt: new Date().toISOString(),
        paymentMethod: 'cash' as 'cash' | 'card' | 'wallet',
        restaurantId: itemsToOrder[0]?.restaurantId || 'default-restaurant',
        paymentStatus: 'pending' as 'pending' | 'paid' | 'failed' | 'refunded'
      };
      
      let orderId;
      let orderResult;
      
      try {
        // Create the order via API using React Query mutation
        const result = await createOrderMutation.mutateAsync(orderData);
        orderId = result.id;
        orderResult = result;
      } catch (error) {
        console.error('Failed to create order via API, generating local order ID', error);
        // Fallback to a randomly generated order ID if API fails
        orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Create a mock order result for local storage (using totalPrice for Order model)
        orderResult = {
          id: orderId,
          userId: userId,
          items: itemsToOrder,
          deliveryAddress: address,
          specialInstructions: instructions,
          status: 'pending',
          totalPrice: displayTotalPrice + 50, // Order model uses totalPrice
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          paymentStatus: 'pending',
          restaurantId: itemsToOrder[0]?.restaurantId || 'default-restaurant'
        };
      }
      
      // Store order in local storage for dashboard metrics without triggering infinite loop
      if (orderResult) {
        try {
          // Extract restaurant ID with better handling
          let orderRestaurantId = orderResult.restaurantId || itemsToOrder[0]?.restaurantId || 'default-restaurant';
          
          // Debug restaurant ID data to help diagnose matching issues
          console.log('Order items:', itemsToOrder);
          console.log('First item restaurantId:', itemsToOrder[0]?.restaurantId);
          console.log('Final restaurantId being used:', orderRestaurantId);
          
          // Make sure the order has the correct structure for the metrics store
          const enhancedOrderResult = {
            ...orderResult,
            // Ensure restaurantId is correctly set
            restaurantId: orderRestaurantId,
            // Make sure seller can retrieve the order by including the raw id too
            restaurantInfo: {
              id: orderRestaurantId,
              _id: orderRestaurantId
            }
          };
          
          // Add the order to metrics without immediate recalculation
          addOrderToMetrics(enhancedOrderResult);
          
          // Log the order addition
          console.log('Order added to metrics store:', orderId);
        } catch (metricError) {
          console.error('Failed to update metrics store:', metricError);
        }
      }
      
      // Clear both carts after successful order
      if (typeof clearCart === 'function') {
        await clearCart();
      }
      cartStore.clearCart();
      
      toast.success('Order placed successfully!');
      
      // Determine the correct dashboard URL based on user role
      const dashboardUrl = user ? 
        user.role === 'seller' ? '/seller/dashboard' : 
        user.role === 'delivery' ? '/delivery/dashboard' : 
        '/customer/dashboard' : 
        '/customer/dashboard';
      
      // Store the dashboard URL in localStorage for redirect after success page
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashboard_redirect', dashboardUrl);
      }
      
      // Redirect to success page with the order info
      router.push(`/checkout/success?orderId=${orderId}&total=${displayTotalPrice + 50}`);
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      toast.error(`Failed to place order: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render page content until hydration is complete
  if (!isPageReady) {
    return (
      <MainLayout>
        <div className="container mx-auto py-10 flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse text-center">
            <h2 className="text-xl font-medium">Loading checkout...</h2>
            <p className="text-gray-500 mt-2">Please wait while we prepare your order</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order details */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea 
                        id="address" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your full delivery address"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                      <Textarea 
                        id="instructions" 
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Any special delivery instructions?"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Place Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Order summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.quantity}x </span>
                        <span>{item.foodItem && typeof item.foodItem === 'object' ? (item.foodItem as any).name : 'Food Item'}</span>
                      </div>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(displayTotalPrice)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>{formatPrice(50)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(displayTotalPrice + 50)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-gray-500 w-full">
                  <p>Your order will be delivered within 30-45 minutes after confirmation.</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 