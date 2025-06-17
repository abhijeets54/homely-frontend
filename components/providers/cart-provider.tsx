"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { FoodItem } from '@/lib/types';
import { LocalCart, LocalCartItem, simplifyFoodItem } from '@/lib/types/local-cart';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store/cartStore';

interface CartContextType {
  cart: LocalCart | null;
  cartItems: LocalCartItem[];
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

  // Get cart items from Zustand store
  const cartItems = useMemo(() => {
    // Convert Zustand cart items to LocalCartItem format
    return cartStore.items.map(item => ({
      id: item.id,
      foodItemId: item.foodItemId,
      foodItem: item.foodItem as any,
      quantity: item.quantity,
      price: item.price
    }));
  }, [cartStore.items]);

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
      // Update Zustand store for immediate UI feedback
      cartStore.addItem(foodItem, quantity);
      
      // Success notification
      toast.success(`${foodItem.name} added to cart`);
      
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
      } else {
        console.error('Item not found in cart:', cartItemId);
      }
    } catch (error) {
      console.error('Error in updateCartItem:', error);
      toast.error('Failed to update item quantity');
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: string) => {
    try {
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
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  // Clear cart
  const clearCart = async () => {
    // Clear the Zustand store
    cartStore.clearCart();
    toast.success('Cart cleared');
  };

  // Create cart object for consumers
  const cartObject: LocalCart = useMemo(() => {
    return {
      id: 'cart',
      items: cartItems,
      totalItems,
      totalAmount: totalPrice
    };
  }, [cartItems, totalItems, totalPrice]);

  // Create the context value object with all cart state and actions
  const contextValue: CartContextType = {
    cart: cartObject,
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