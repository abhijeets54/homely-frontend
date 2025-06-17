"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Cart, CartItem, FoodItem } from '@/lib/types';
import { LocalCart, LocalCartItem, simplifyFoodItem } from '@/lib/types/local-cart';
import { cartApi } from '@/lib/api/cart';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store/cartStore';

interface CartContextType {
  cart: Cart | LocalCart | null;
  cartItems: CartItem[] | LocalCartItem[];
  isLoading: boolean;
  totalItems: number;
  totalPrice: number;
  addToCart: (foodItem: FoodItem, quantity: number) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openCartCallback: (() => void) | null;
  setOpenCartCallback: (callback: () => void) => void;
}

// Create a default value for the context to prevent undefined errors
const defaultCartContext: CartContextType = {
  cart: null,
  cartItems: [],
  isLoading: false,
  totalItems: 0,
  totalPrice: 0,
  addToCart: async () => {},
  updateCartItem: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  openCartCallback: null,
  setOpenCartCallback: () => {},
};

// Create the context with a default value
const CartContext = createContext<CartContextType>(defaultCartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // For authenticated users with backend cart
  const [serverCart, setServerCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldOpenCart, setShouldOpenCart] = useState(false);
  const [openCartCallback, setOpenCartCallback] = useState<(() => void) | null>(null);
  const { user, isAuthenticated } = useAuth();
  
  // Get the zustand store - this will be our primary cart implementation
  const cartStore = useCartStore();
  
  // Ensure Zustand store is hydrated on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // This is needed for zustand persist hydration
      useCartStore.persist.rehydrate();
    }
  }, []);

  // Effect to handle cart opening - only when items are explicitly added
  useEffect(() => {
    // Only open the cart when shouldOpenCart is true and we have a callback
    // This should only happen when addToCart is called
    if (shouldOpenCart && openCartCallback) {
      openCartCallback();
      setShouldOpenCart(false);
    }
  }, [shouldOpenCart, openCartCallback]);
  
  // Reset shouldOpenCart on mount to prevent cart from opening on page reload
  useEffect(() => {
    // This ensures the cart won't open on page load/navigation
    setShouldOpenCart(false);
  }, []);

  // Load server cart for authenticated users
  const loadServerCart = async () => {
    // Only attempt to load cart if user is authenticated and is a customer
    if (!isAuthenticated || !user || user.role !== 'customer') {
      setServerCart(null);
      return;
    }

    try {
      setIsLoading(true);
      // The backend uses the token to identify the user
      const cartData = await cartApi.getCart();
      // Use type assertion to handle any inconsistencies between Cart types
      setServerCart(cartData as unknown as Cart);
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Don't show error toast on initial load
      setServerCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load cart if user is authenticated and is a customer
    if (isAuthenticated && user && user.role === 'customer') {
      loadServerCart();
    } else {
      setServerCart(null);
    }
  }, [user, isAuthenticated]);

  // Get cart items either from server cart or Zustand store
  const cartItems = useMemo(() => {
    if (serverCart) {
      return serverCart.items;
    } else {
      // Convert Zustand cart items to LocalCartItem format
      return cartStore.items.map(item => ({
        id: item.id,
        foodItemId: item.foodItemId,
        foodItem: item.foodItem as any,
        quantity: item.quantity,
        price: item.price
      }));
    }
  }, [serverCart, cartStore.items]);

  // Calculate total items
  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Add item to cart
  const addToCart = async (foodItem: FoodItem, quantity: number) => {
    try {
      // First update Zustand store for immediate UI feedback
      cartStore.addItem(foodItem, quantity);
      
      // Success notification
      toast.success(`${foodItem.name} added to cart`);
      
      // If user is authenticated, sync with backend
      if (isAuthenticated && user) {
        if (user.role !== 'customer') {
          toast.error('Only customers can add items to cart');
          return;
        }

        // Sync with the backend
        setIsLoading(true);
        try {
          console.log('Syncing cart with backend for item:', foodItem.id);
          const updatedCart = await cartApi.addToCart(foodItem.id, quantity);
          // Use type assertion to handle any inconsistencies between Cart types
          setServerCart(updatedCart as unknown as Cart);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add item to cart';
          toast.error(message);
          console.error('Failed to add to cart:', error);
          
          // Ensure UI is in sync if backend operation fails
          await loadServerCart();
        } finally {
          setIsLoading(false);
        }
      }
      
      // Set flag to open cart
      setShouldOpenCart(true);
    } catch (err) {
      console.error('Error in addToCart:', err);
      toast.error('Failed to add item to cart');
    }
  };

  // Update cart item quantity
  const updateCartItem = async (cartItemId: string, quantity: number) => {
    try {
      // Handle local cart update through Zustand
      if (cartItemId.startsWith('local-') || !isAuthenticated) {
        // Find matching item in Zustand store
        const zustandItem = cartStore.items.find(item => {
          // Match either by id or by foodItemId
          return item.id === cartItemId || 
                 (cartItemId.includes(item.foodItemId) || 
                 (typeof item.foodItem === 'object' && item.foodItem?.id === cartItemId));
        });
        
        if (zustandItem) {
          if (quantity <= 0) {
            cartStore.removeItem(zustandItem.id);
          } else {
            cartStore.updateQuantity(zustandItem.id, quantity);
          }
          return;
        } else {
          console.error('Item not found in cart:', cartItemId);
          return;
        }
      }
      
      // Handle backend cart update for authenticated users
      setIsLoading(true);
      try {
        const updatedCart = await cartApi.updateCartItem(cartItemId, quantity);
        // Use type assertion to handle any inconsistencies between Cart types
        setServerCart(updatedCart as unknown as Cart);
      } catch (error) {
        console.error('Error updating cart item:', error);
        toast.error('Failed to update item quantity');
        
        // Reload cart to ensure UI is in sync with server state
        await loadServerCart();
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in updateCartItem:', error);
      toast.error('Failed to update item quantity');
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: string) => {
    try {
      // Handle local cart removal through Zustand
      if (cartItemId.startsWith('local-') || !isAuthenticated) {
        // Find the item in Zustand store
        const zustandItem = cartStore.items.find(item => {
          // Match either by id or by foodItemId
          return item.id === cartItemId || 
                 cartItemId.includes(item.foodItemId) || 
                 (typeof item.foodItem === 'object' && item.foodItem?.id === cartItemId);
        });
        
        if (zustandItem) {
          cartStore.removeItem(zustandItem.id);
          toast.success('Item removed from cart');
        }
        return;
      }
      
      // Handle backend cart removal for authenticated users
      setIsLoading(true);
      try {
        const updatedCart = await cartApi.removeFromCart(cartItemId);
        // Use type assertion to handle any inconsistencies between Cart types
        setServerCart(updatedCart as unknown as Cart);
        toast.success('Item removed from cart');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to remove item from cart';
        toast.error(message);
        console.error('Failed to remove from cart:', error);
        
        // Reload cart to ensure UI is in sync with server state
        await loadServerCart();
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      toast.error('Failed to remove item from cart');
      // Only set loading to false if we're authenticated and had set it to true earlier
      if (isAuthenticated) {
        setIsLoading(false);
      }
    }
  };

  // Clear cart
  const clearCart = async () => {
    // Always clear the Zustand store
    cartStore.clearCart();
    
    // If user is authenticated, also clear the backend cart
    if (isAuthenticated && user && user.role === 'customer') {
      try {
        setIsLoading(true);
        await cartApi.clearCart();
        setServerCart(null);
      } catch (error) {
        console.error('Failed to clear backend cart:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    toast.success('Cart cleared');
  };

  // Create cart object for consumers
  const cartObject: LocalCart = useMemo(() => {
    return {
      id: 'cart',
      items: cartItems as LocalCartItem[],
      totalItems,
      totalAmount: totalPrice
    };
  }, [cartItems, totalItems, totalPrice]);

  // Create the context value object with all cart state and actions
  const contextValue: CartContextType = {
    cart: serverCart || cartObject,
    cartItems,
    isLoading,
    totalItems,
    totalPrice,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    openCartCallback,
    setOpenCartCallback,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  
  // Just return default context if it's not defined,
  // this allows components to use the hook during initial render
  // when providers might not be available yet
  return context || defaultCartContext;
} 