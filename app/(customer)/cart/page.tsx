'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart, useUpdateCartStatus } from '@/lib/api';
import { CartItem, FoodItem } from '@/lib/types/models';
import { ShoppingCart, Trash, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Cart query
  const { 
    data: cart, 
    isLoading: cartLoading, 
    error: cartError,
    refetch: refetchCart
  } = useCart();
  
  // Cart mutations
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const updateCartStatus = useUpdateCartStatus();

  // Handle quantity update
  const handleUpdateQuantity = (cartItemId: string, quantity: number) => {
    if (!user?.id) return;
    
    updateCartItem.mutate(
      { cartItemId, quantity },
      {
        onSuccess: () => {
          toast({
            title: "Cart Updated",
            description: "Item quantity has been updated.",
          });
          refetchCart();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }
    );
  };

  // Handle remove item
  const handleRemoveItem = (cartItemId: string) => {
    if (!user?.id) return;
    
    removeFromCart.mutate(
      cartItemId,
      {
        onSuccess: () => {
          toast({
            title: "Item Removed",
            description: "Item has been removed from your cart.",
          });
          refetchCart();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to remove item: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }
    );
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (!user?.id) return;
    
    clearCart.mutate(
      undefined,
      {
        onSuccess: () => {
          toast({
            title: "Cart Cleared",
            description: "All items have been removed from your cart.",
          });
          refetchCart();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to clear cart: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }
    );
  };

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (!user?.id) return;
    
    updateCartStatus.mutate(
      { status: 'checkout' },
      {
        onSuccess: () => {
          toast({
            title: "Proceeding to Checkout",
            description: "Your cart is ready for checkout.",
          });
          window.location.href = '/checkout';
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to proceed to checkout: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }
    );
  };

  // Calculate total price
  const calculateTotal = (items: CartItem[] = []) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Check if cart is empty
  const isCartEmpty = !cart || !cart.items || cart.items.length === 0;

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to view your cart.</p>
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
          <Link href="/restaurants" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>

        {cartLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
            <div className="flex justify-between mt-6">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        ) : cartError ? (
          <Card className="p-6 text-center">
            <CardTitle className="text-red-500 mb-2">Error Loading Cart</CardTitle>
            <CardDescription>
              We encountered an error while loading your cart. Please try again later.
            </CardDescription>
            <Button className="mt-4" onClick={() => refetchCart()}>
              Retry
            </Button>
          </Card>
        ) : isCartEmpty ? (
          <Card className="p-6 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <CardTitle className="mb-2">Your Cart is Empty</CardTitle>
            <CardDescription className="mb-6">
              You haven't added any items to your cart yet. Start shopping to add items.
            </CardDescription>
            <Button asChild>
              <Link href="/restaurants">Browse Restaurants</Link>
            </Button>
          </Card>
        ) : (
          <>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {cart.items?.length} {cart.items?.length === 1 ? 'Item' : 'Items'} in Cart
                </h2>
                <Button variant="outline" onClick={handleClearCart} disabled={updateCartItem.isPending}>
                  <Trash className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
              
              <div className="space-y-4">
                {cart.items?.map((item: CartItem) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative h-32 sm:h-auto sm:w-1/4 max-w-[200px]">
                        <Image
                          src={item.foodItem?.imageUrl || '/placeholder-food.jpg'}
                          alt={item.foodItem?.name || 'Food item'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex flex-col sm:flex-row justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{item.foodItem?.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {item.foodItem?.description || 'No description available'}
                            </p>
                            <p className="font-medium">₹{item.price.toFixed(2)} each</p>
                          </div>
                          <div className="mt-4 sm:mt-0 flex flex-col items-end">
                            <p className="font-bold mb-2">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                disabled={updateCartItem.isPending || item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={updateCartItem.isPending}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={removeFromCart.isPending}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹{calculateTotal(cart.items).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery Fee</span>
                <span>50.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
                <span>Total</span>
                <span>₹{(calculateTotal(cart.items) + 50).toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={handleProceedToCheckout}
                disabled={updateCartStatus.isPending || isCartEmpty}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
} 