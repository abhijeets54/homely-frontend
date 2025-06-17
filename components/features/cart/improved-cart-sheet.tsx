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
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useCart } from '@/components/providers/cart-provider';
import { useAuth } from '@/providers/auth-provider';
import { formatPrice } from '@/lib/utils/format';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define a type that represents the foodItem structure we'll work with
interface CartFoodItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
}

export function ImprovedCartSheet() {
  // Initialize open state to false to ensure cart is closed on page load/navigation
  const [open, setOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Get cart data from context, safely using optional chaining
  const cartContext = useCart();
  const cartItems = cartContext?.cartItems || [];
  const totalItems = cartContext?.totalItems || 0;
  const totalPrice = cartContext?.totalPrice || 0;
  const updateCartItem = cartContext?.updateCartItem || (async () => {});
  const removeFromCart = cartContext?.removeFromCart || (async () => {});
  const setOpenCartCallback = cartContext?.setOpenCartCallback || (() => {});

  const isInitialMount = useRef(true);
  const hasRegisteredCallback = useRef(false);
  const isPageLoad = useRef(true);

  // Function to open the cart sheet
  const openCartSheet = useCallback(() => {
    setOpen(true);
  }, []);

  // Register the open function with the cart provider on mount
  useEffect(() => {
    if (!hasRegisteredCallback.current && typeof setOpenCartCallback === 'function') {
      setOpenCartCallback(openCartSheet);
      hasRegisteredCallback.current = true;
    }
    
    return () => {
      if (hasRegisteredCallback.current && typeof setOpenCartCallback === 'function') {
        setOpenCartCallback(() => {});
        hasRegisteredCallback.current = false;
      }
    };
  }, [setOpenCartCallback, openCartSheet]);

  // Handle animation when cart opens
  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 600); // Animation duration + slight delay
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Function to handle checkout
  const handleCheckout = useCallback(() => {
    // Proceed to checkout page directly, both for authenticated and guest users
    router.push('/checkout');
    setOpen(false);
  }, [router]);

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

  // Make sure the cart doesn't open on initial render or page navigation
  useEffect(() => {
    // Close the cart on component mount (page load/navigation)
    setOpen(false);
    
    // Reset the page load flag after a short delay
    const timer = setTimeout(() => {
      isPageLoad.current = false;
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Helper function to safely access the foodItem's imageUrl
  const getImageUrl = (item: any): string => {
    if (!item.foodItem) return '/images/default.jpg';
    
    // Try to access imageUrl from various possible structures
    if (typeof item.foodItem === 'object') {
      // Check for different image property names
      if ('imageUrl' in item.foodItem && item.foodItem.imageUrl) {
        return item.foodItem.imageUrl;
      }
      
      if ('image' in item.foodItem && item.foodItem.image) {
        return item.foodItem.image as string;
      }
    }
    
    return '/images/default.jpg';
  };

  // Helper function to safely access the foodItem's name
  const getName = (item: any): string => {
    if (!item.foodItem) return 'Unknown Item';
    
    if (typeof item.foodItem === 'object' && 'name' in item.foodItem) {
      return item.foodItem.name;
    }
    
    return 'Unknown Item';
  };

  return (
    <div>
      <Button 
        variant="outline" 
        size="sm" 
        className="relative"
        onClick={(e) => {
          e.preventDefault();
          if (!isPageLoad.current) {
            setOpen(true);
          }
        }}
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        Cart
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Button>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg p-0 border-l">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Your Cart</SheetTitle>
              <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span className="sr-only">Close</span>
              </SheetClose>
            </SheetHeader>
            
            <div className="flex-1 overflow-hidden">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  <p className="text-gray-500 text-lg font-medium mb-2">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mb-6">Add items to your cart to proceed with checkout.</p>
                  <Button variant="outline" onClick={() => setOpen(false)}>Continue Shopping</Button>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6">
                      {cartItems.map((item, index) => (
                        <div 
                          key={item.id} 
                          className={cn(
                            "flex border-b border-gray-100 pb-4 transition-all",
                            isAnimating && "animate-[fade-in_0.3s_ease-out]",
                            isAnimating && `opacity-0 translate-y-2 [animation-delay:${100 + index * 75}ms] [animation-fill-mode:forwards]`
                          )}
                        >
                          <div className="relative h-20 w-20 overflow-hidden rounded-md mr-4 flex-shrink-0">
                            {getImageUrl(item) ? (
                              <Image
                                src={getImageUrl(item)}
                                alt={getName(item)}
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
                              <h3 className="font-medium">{getName(item)}</h3>
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
                  
                  <div className="border-t border-gray-200 p-4 mt-auto">
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
                    <Button className="w-full shadow-md" onClick={handleCheckout}>
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
