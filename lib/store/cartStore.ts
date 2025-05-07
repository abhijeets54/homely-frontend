import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart } from '../types/models';

interface CartStore {
  isOpen: boolean;
  cart: Cart | null;
  setIsOpen: (isOpen: boolean) => void;
  setCart: (cart: Cart | null) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      isOpen: false,
      cart: null,
      setIsOpen: (isOpen) => set({ isOpen }),
      setCart: (cart) => set({ cart }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ isOpen: state.isOpen }), // Only persist isOpen state
    }
  )
); 