'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';

interface CartContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  items: any[];
  addItem: (item: any, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

// Create a default context to prevent errors when used outside provider
const defaultCartContext: CartContextType = {
  isOpen: false,
  setIsOpen: () => {},
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getTotal: () => 0,
};

const CartContext = createContext<CartContextType>(defaultCartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const store = useCartStore;

  useEffect(() => {
    // Hydrate the store
    store.persist.rehydrate();
    setIsHydrated(true);
  }, [store.persist]);

  // Prevent flash of incorrect content
  if (!isHydrated) {
    return null;
  }

  const value = {
    isOpen: store.getState().isOpen,
    setIsOpen: store.getState().setIsOpen,
    items: store.getState().items,
    addItem: store.getState().addItem,
    removeItem: store.getState().removeItem,
    updateQuantity: store.getState().updateQuantity,
    clearCart: store.getState().clearCart,
    getTotal: store.getState().getTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  // Return the context even if undefined - will use default values
  return context;
} 