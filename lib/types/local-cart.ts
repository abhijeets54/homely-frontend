import { CartItem, FoodItem } from './index';

// Simplified version of CartItem for local cart use
export interface LocalCartItem {
  id: string;
  foodItemId: string;
  foodItem?: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    isAvailable: boolean;
  };
  quantity: number;
  price: number;
}

// Simplified version of Cart for local cart use
export interface LocalCart {
  id: string;
  items: LocalCartItem[];
  totalItems: number;
  totalAmount: number;
}

// Helper function to convert FoodItem to a simplified version for local cart
export function simplifyFoodItem(foodItem: FoodItem) {
  return {
    id: foodItem.id,
    name: foodItem.name,
    price: foodItem.price,
    imageUrl: foodItem.imageUrl,
    isAvailable: foodItem.isAvailable
  };
}
