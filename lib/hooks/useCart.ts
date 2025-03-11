import { useState, useEffect } from 'react';
import { customerApi } from '@/lib/api';
import { Cart, CartItem, FoodItem } from '@/lib/types/models';
import { getStorageItem, setStorageItem } from '@/lib/utils/storage';

interface UseCartReturn {
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

// Local storage key for cart
const CART_STORAGE_KEY = 'homely_cart';
const CART_ITEMS_STORAGE_KEY = 'homely_cart_items';

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Calculate total items and price
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Initialize cart from API or local storage
  useEffect(() => {
    const initCart = async () => {
      try {
        // Try to get cart from API first (if user is logged in)
        const apiCart = await customerApi.getCart();
        setCart(apiCart);
        
        // Get cart items
        if (apiCart?.id) {
          const apiCartItems = await customerApi.getCartItems(apiCart.id);
          setCartItems(apiCartItems);
          
          // Update local storage
          setStorageItem(CART_STORAGE_KEY, apiCart);
          setStorageItem(CART_ITEMS_STORAGE_KEY, apiCartItems);
        }
      } catch (error) {
        // If API fails, try to get cart from local storage
        const storedCart = getStorageItem<Cart>(CART_STORAGE_KEY);
        const storedCartItems = getStorageItem<CartItem[]>(CART_ITEMS_STORAGE_KEY) || [];
        
        setCart(storedCart);
        setCartItems(storedCartItems);
      } finally {
        setIsLoading(false);
      }
    };

    initCart();
  }, []);

  // Add item to cart
  const addToCart = async (foodItem: FoodItem, quantity: number) => {
    setIsLoading(true);
    
    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.foodItemId === foodItem.id);
      
      if (existingItem) {
        // Update quantity if item exists
        await updateCartItem(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Add new item if it doesn't exist
        if (cart?.id) {
          // If user is logged in, add to API
          const newItem = await customerApi.addToCart(foodItem.id, quantity);
          setCartItems([...cartItems, { ...newItem, foodItem }]);
        } else {
          // If user is not logged in, add to local storage
          const newItem: CartItem = {
            id: `local_${Date.now()}`,
            cartId: 'local_cart',
            foodItemId: foodItem.id,
            quantity,
            price: foodItem.price,
            foodItem
          };
          
          const updatedItems = [...cartItems, newItem];
          setCartItems(updatedItems);
          setStorageItem(CART_ITEMS_STORAGE_KEY, updatedItems);
        }
      }
    } catch (error) {
      // Handle error
      console.error('Failed to add item to cart', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (cartItemId: string, quantity: number) => {
    setIsLoading(true);
    
    try {
      if (cart?.id && !cartItemId.startsWith('local_')) {
        // If user is logged in, update via API
        await customerApi.updateCartItem(cartItemId, quantity);
      }
      
      // Update local state
      const updatedItems = cartItems.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      );
      
      setCartItems(updatedItems);
      setStorageItem(CART_ITEMS_STORAGE_KEY, updatedItems);
    } catch (error) {
      // Handle error
      console.error('Failed to update cart item', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: string) => {
    setIsLoading(true);
    
    try {
      if (cart?.id && !cartItemId.startsWith('local_')) {
        // If user is logged in, remove via API
        await customerApi.removeFromCart(cartItemId);
      }
      
      // Update local state
      const updatedItems = cartItems.filter(item => item.id !== cartItemId);
      setCartItems(updatedItems);
      setStorageItem(CART_ITEMS_STORAGE_KEY, updatedItems);
    } catch (error) {
      // Handle error
      console.error('Failed to remove item from cart', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    setIsLoading(true);
    
    try {
      // Clear cart items one by one
      for (const item of cartItems) {
        if (cart?.id && !item.id.startsWith('local_')) {
          await customerApi.removeFromCart(item.id);
        }
      }
      
      // Update local state
      setCartItems([]);
      setStorageItem(CART_ITEMS_STORAGE_KEY, []);
    } catch (error) {
      // Handle error
      console.error('Failed to clear cart', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cart,
    cartItems,
    isLoading,
    totalItems,
    totalPrice,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  };
} 