'use client';

import { useAuth } from '@/lib/context/auth-context';
import { useCart, useUpdateCart, useCreateOrder } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  MinusCircle,
  PlusCircle,
  ShoppingCart,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { user } = useAuth();
  const { data: cart, isLoading } = useCart(user?.id || '');
  const { mutate: updateCart } = useUpdateCart();
  const { mutate: createOrder } = useCreateOrder();
  const { toast } = useToast();

  const handleUpdateQuantity = (foodItemId: string, quantity: number) => {
    if (!cart) return;

    const updatedItems = cart.items.map((item) =>
      item.foodItemId === foodItemId
        ? { ...item, quantity: Math.max(0, item.quantity + quantity) }
        : item
    );

    updateCart(
      {
        cartId: cart.id,
        items: updatedItems.filter((item) => item.quantity > 0),
      },
      {
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to update cart. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleCheckout = () => {
    if (!cart || !user) return;

    createOrder(
      {
        restaurantId: cart.items[0]?.foodItem?.restaurantId || '',
        userId: user.id,
        status: 'pending',
        totalPrice: calculateTotal(),
        paymentStatus: 'pending',
        deliveryAddress: user.address,
        items: cart.items.map((item) => ({
          foodItemId: item.foodItemId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Order placed successfully!',
          });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to place order. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-24 w-24 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added any items to your cart yet.
          </p>
          <Button asChild>
            <Link href="/customer/dashboard">Browse Menu</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                      <Image
                        src={item.foodItem?.imageUrl || '/images/placeholder.jpg'}
                        alt={item.foodItem?.name || 'Food item'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold">{item.foodItem?.name}</h3>
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        ${item.price.toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              handleUpdateQuantity(item.foodItemId, -1)
                            }
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              handleUpdateQuantity(item.foodItemId, 1)
                            }
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            handleUpdateQuantity(item.foodItemId, -item.quantity)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>$5.00</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${(calculateTotal() + 5).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <div className="space-y-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input
                      id="address"
                      defaultValue={user?.address}
                      placeholder="Enter delivery address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Special Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Add any special instructions..."
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 