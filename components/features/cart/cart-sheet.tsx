'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/providers/cart-provider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { CartItem } from './cart-item';

export function CartSheet() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, totalPrice, setOpenCartCallback } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Register the open cart callback when the component mounts
  useEffect(() => {
    setOpenCartCallback(() => {
      setIsOpen(true);
    });
  }, [setOpenCartCallback]);

  // Close cart on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to checkout',
        variant: 'destructive',
      });
      return;
    }
    // Handle checkout logic
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <CartItem key={item.id || index} item={item as any} />
                ))}
              </div>
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between mb-4">
                  <span className="font-medium">Total</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
          </div>
      </SheetContent>
    </Sheet>
  );
} 