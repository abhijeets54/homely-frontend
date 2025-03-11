'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/ui/icons';
import { useCart } from '@/lib/hooks/use-cart';
import { useAuth } from '@/lib/hooks/use-auth';
import { formatPrice } from '@/lib/utils';

export function CartSheet() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const cart = useCart();

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to checkout',
        variant: 'destructive',
      });
      router.push('/login?redirectTo=/checkout');
      return;
    }

    router.push('/checkout');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Open cart"
        >
          <Icons.cart className="h-4 w-4" />
          {cart.items.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {cart.items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>Cart ({cart.items.length})</SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        {cart.items.length > 0 ? (
          <>
            <ScrollArea className="flex-1 pr-6">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                      <Image
                        src={item.foodItem?.imageUrl || ''}
                        alt={item.foodItem?.name || ''}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium">{item.foodItem?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          cart.updateQuantity(item.id, Math.max(0, item.quantity - 1))
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Icons.minus className="h-3 w-3" />
                        <span className="sr-only">Remove one item</span>
                      </Button>
                      <span className="w-4 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          cart.updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Icons.plus className="h-3 w-3" />
                        <span className="sr-only">Add one item</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => cart.removeItem(item.id)}
                      >
                        <Icons.trash className="h-3 w-3" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="space-y-4 pr-6">
              <Separator />
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">
                    {formatPrice(cart.getTotal())}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Shipping and taxes will be calculated at checkout.
                </p>
              </div>
              <Button className="w-full" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-2">
            <Icons.cart className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-medium">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Add items to your cart to proceed with checkout.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
} 