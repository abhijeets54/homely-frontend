"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, FoodItem } from '@/lib/types';
import { cartApi } from '@/lib/api/cart';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  isLoading: boolean;
  totalItems: number;
  totalPrice: number;
  addToCart: (foodItem: FoodItem, quantity: number) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const loadCart = async () => {
    // Only attempt to load cart if user is authenticated and is a customer
    if (!isAuthenticated || !user?.id || user.role !== 'customer') {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      // The backend uses the token to identify the user
      const cartData = await cartApi.getCart(user.id);
      setCart(cartData);
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
    if (isAuthenticated && user?.id && user.role === 'customer') {
      loadCart();
    } else {
      setCart(null);
    }
  }, [user?.id, isAuthenticated, user?.role]);

  const addToCart = async (foodItem: FoodItem, quantity: number) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can add items to cart');
      return;
    }

    try {
      setIsLoading(true);
      const updatedCart = await cartApi.addToCart(user.id, foodItem.id, quantity);
      setCart(updatedCart);
      toast.success('Item added to cart');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add item to cart';
      toast.error(message);
      console.error('Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please login to update cart');
      return;
    }

    try {
      setIsLoading(true);
      const updatedCart = await cartApi.updateCartItem(user.id, cartItemId, quantity);
      setCart(updatedCart);
      toast.success('Cart updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update cart';
      toast.error(message);
      console.error('Failed to update cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please login to remove items');
      return;
    }

    try {
      setIsLoading(true);
      const updatedCart = await cartApi.removeFromCart(user.id, cartItemId);
      setCart(updatedCart);
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
    if (!isAuthenticated || !user?.id) {
      toast.error('Please login to clear cart');
      return;
    }

    try {
      setIsLoading(true);
      await cartApi.clearCart(user.id);
      setCart(null);
      toast.success('Cart cleared');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clear cart';
      toast.error(message);
      console.error('Failed to clear cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total items and price safely
  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice = cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart?.items || [],
        isLoading,
        totalItems,
        totalPrice,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
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