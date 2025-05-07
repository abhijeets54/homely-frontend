'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCart } from '@/components/providers/cart-provider';
import { useAuth } from '@/providers/auth-provider';
import { formatPrice } from '@/lib/utils/format';

export function ImprovedCartSheet() {
  const [open, setOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string>('');
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart, cartItems, totalItems, totalPrice, updateCartItem, removeFromCart, setOpenCartCallback } = useCart();
  const isInitialMount = useRef(true);

  // Function to open the cart sheet
  const openCartSheet = useCallback(() => {
    setOpen(true);
  }, []);

  // Register the open function with the cart provider
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    setOpenCartCallback(openCartSheet);
    return () => {
      setOpenCartCallback(() => {});
    };
  }, [setOpenCartCallback, openCartSheet]);

  // Function to handle checkout
  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      router.push('/login?redirectTo=/checkout');
      return;
    }

    router.push('/checkout');
    setOpen(false);
  }, [isAuthenticated, router]);

  // Function to update item quantity
  const handleUpdateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
      } else {
        await updateCartItem(itemId, quantity);
      }
    } catch (error) {
      toast.error('Failed to update item quantity');
    }
  }, [removeFromCart, updateCartItem]);

  // Function to remove item
  const handleRemoveItem = useCallback(async (itemId: string) => {
    try {
      setIsRemoving(itemId);
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from cart');
    } finally {
      setIsRemoving('');
    }
  }, [removeFromCart]);

  // Handle sheet open state changes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative"
          onClick={(e) => {
            e.preventDefault();
            handleOpenChange(true);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg">
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p className="text-gray-500 text-lg font-medium mb-2">Your cart is empty</p>
                <p className="text-gray-400 text-sm mb-6">Add items to your cart to proceed with checkout.</p>
                <SheetClose asChild>
                  <Button variant="outline">Continue Shopping</Button>
                </SheetClose>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-6 pr-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex border-b border-gray-100 pb-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-md mr-4 flex-shrink-0">
                          {item.foodItem?.imageUrl ? (
                            <Image
                              src={item.foodItem.imageUrl}
                              alt={item.foodItem.name || 'Food item'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="bg-gray-100 h-full w-full flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{item.foodItem?.name}</h3>
                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{formatPrice(item.price)} per item</p>
                          <div className="flex items-center mt-2">
                            <div className="flex items-center border rounded-md">
                              <button
                                className="px-2 py-1 text-gray-500 hover:text-gray-700"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-2 py-1 text-sm">{item.quantity}</span>
                              <button
                                className="px-2 py-1 text-gray-500 hover:text-gray-700"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="ml-3 text-red-500 hover:text-red-700 text-sm flex items-center"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving === item.id}
                            >
                              {isRemoving === item.id ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Removing...
                                </>
                              ) : 'Remove'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">{formatPrice(50)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mb-6">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice + 50)}</span>
                  </div>
                  <Button className="w-full" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
  );
}
