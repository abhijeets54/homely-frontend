import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, FoodItem } from '@/lib/types';

interface CartStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  items: CartItem[];
  addItem: (item: FoodItem, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      items: [],
      addItem: (item: FoodItem, quantity: number) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.foodItemId === item.id
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.foodItemId === item.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: crypto.randomUUID(),
                foodItemId: item.id,
                quantity,
                price: item.price,
                foodItem: item,
              },
            ],
          };
        });
      },
      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        }));
      },
      updateQuantity: (itemId: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotal: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    }
  )
); 