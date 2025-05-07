"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Cart, CartItem, FoodItem } from '@/lib/types';
import { LocalCart, LocalCartItem, simplifyFoodItem } from '@/lib/types/local-cart';
import { cartApi } from '@/lib/api/cart';
import { useAuth } from '@/providers/auth-provider';
import { User } from '@/lib/types/auth';
import { toast } from 'sonner';

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

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [localCart, setLocalCart] = useState<LocalCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldOpenCart, setShouldOpenCart] = useState(false);
  const [openCartCallback, setOpenCartCallback] = useState<(() => void) | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Effect to handle cart opening
  useEffect(() => {
    if (shouldOpenCart && openCartCallback) {
      openCartCallback();
      setShouldOpenCart(false);
    }
  }, [shouldOpenCart, openCartCallback]);

  // Memoize cart items
  const cartItems = useMemo(() => {
    return cart ? cart.items : localCart ? localCart.items : [];
  }, [cart, localCart]);

  // Memoize total items calculation
  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Memoize total price calculation
  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const loadCart = async () => {
    // Only attempt to load cart if user is authenticated and is a customer
    if (!isAuthenticated || !user || user.role !== 'customer') {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      // The backend uses the token to identify the user
      const cartData = await cartApi.getCart();
      setCart(cartData as Cart);
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Don't show error toast on initial load
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load cart if user is authenticated and is a customer
    if (isAuthenticated && user && user.role === 'customer') {
      loadCart();
    } else {
      setCart(null);
    }
  }, [user, isAuthenticated]);

  const addToCart = async (foodItem: FoodItem, quantity: number) => {
    try {
      // First, update the local cart state immediately for better UX
      const updatedLocalCart = updateLocalCartState(foodItem, quantity);
      
      // Success notification
      toast.success(`${foodItem.name} added to cart`);
      
      // If user is not authenticated, just keep the local cart
      if (!isAuthenticated || !user) {
        // Set flag to open cart instead of calling directly
        setShouldOpenCart(true);
        return;
      }

      if (user.role !== 'customer') {
        toast.error('Only customers can add items to cart');
        return;
      }

      // Then, sync with the backend
      setIsLoading(true);
      try {
        console.log('Syncing cart with backend for item:', foodItem.id);
        const updatedCart = await cartApi.addToCart(foodItem.id, quantity);
        setCart(updatedCart as Cart);
        // Set flag to open cart after successful sync
        setShouldOpenCart(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add item to cart';
        toast.error(message);
        console.error('Failed to add to cart:', error);
      } finally {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error in addToCart:', err);
      toast.error('Failed to add item to cart');
    }
  };
  
  // Helper function to update local cart state
  const updateLocalCartState = (foodItem: FoodItem, quantity: number): LocalCart => {
    // Create a copy of the current local cart or initialize a new one
    const currentLocalCart: LocalCart = localCart || {
      id: 'local-cart',
      items: [],
      totalItems: 0,
      totalAmount: 0
    };
    
    // Check if the item already exists in the cart
    const existingItemIndex = currentLocalCart.items.findIndex(
      item => item.foodItemId === foodItem.id || item.foodItem?.id === foodItem.id
    );
    
    // Create a deep copy of the cart items
    const updatedItems = [...currentLocalCart.items];
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = {...updatedItems[existingItemIndex]};
      existingItem.quantity += quantity;
      updatedItems[existingItemIndex] = existingItem;
    } else {
      // Add new item
      updatedItems.push({
        id: `local-${Date.now()}`,
        foodItemId: foodItem.id,
        foodItem: simplifyFoodItem(foodItem),
        quantity: quantity,
        price: foodItem.price
      });
    }
    
    // Calculate new totals
    const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create the updated cart
    const updatedLocalCart = {
      ...currentLocalCart,
      items: updatedItems,
      totalItems,
      totalAmount
    };
    
    // Update state
    setLocalCart(updatedLocalCart);
    
    return updatedLocalCart;
  };

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    // Check if this is a local cart item (id starts with 'local-')
    if (cartItemId.startsWith('local-')) {
      try {
        // Handle local cart update
        if (!localCart) return;
        
        // Create a deep copy of the cart items
        const updatedItems = [...localCart.items];
        
        // Find the item to update
        const itemIndex = updatedItems.findIndex(item => item.id === cartItemId);
        
        if (itemIndex === -1) {
          console.error('Item not found in local cart:', cartItemId);
          return;
        }
        
        // Update the item quantity
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: quantity
        };
        
        // Calculate new totals
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update the local cart
        const updatedLocalCart = {
          ...localCart,
          items: updatedItems,
          totalItems,
          totalAmount
        };
        
        setLocalCart(updatedLocalCart);
      } catch (error) {
        console.error('Error updating local cart item:', error);
        toast.error('Failed to update item quantity');
      }
      return;
    }
    
    // Handle backend cart update
    if (!isAuthenticated || !user) {
      toast.error('Please login to update cart');
      return;
    }

    try {
      setIsLoading(true);
      const updatedCart = await cartApi.updateCartItem(cartItemId, quantity);
      setCart(updatedCart as Cart);
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update item quantity');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      setIsLoading(true);
      
      // Check if this is a local cart item (id starts with 'local-')
      if (cartItemId.startsWith('local-')) {
        if (!localCart) return;
        
        // Filter out the item to be removed
        const updatedItems = localCart.items.filter(item => item.id !== cartItemId);
        
        // Calculate new totals
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update the local cart
        const updatedLocalCart = {
          ...localCart,
          items: updatedItems,
          totalItems,
          totalAmount
        };
        
        setLocalCart(updatedLocalCart);
        toast.success('Item removed from cart');
        return;
      }
      
      // Handle backend cart removal
      if (!isAuthenticated || !user) {
        toast.error('Please login to remove items from cart');
        return;
      }
      
      const updatedCart = await cartApi.removeFromCart(cartItemId);
      setCart(updatedCart as Cart);
      toast.success('Item removed from cart');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove item from cart';
      toast.error(message);
      console.error('Failed to remove from cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    // Always clear the local cart
    setLocalCart({
      id: 'local-cart',
      items: [],
      totalItems: 0,
      totalAmount: 0
    });
    
    // If user is authenticated, also clear the backend cart
    if (isAuthenticated && user && user.role === 'customer') {
      try {
        setIsLoading(true);
        await cartApi.clearCart();
        setCart(null);
      } catch (error) {
        console.error('Failed to clear backend cart:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    toast.success('Cart cleared');
  };

  return (
    <CartContext.Provider
      value={{
        cart: cart || localCart,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 