'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash } from 'lucide-react';
import { useCart } from '@/components/providers/cart-provider';
import { LocalCartItem } from '@/lib/types/local-cart';

interface CartItemProps {
  item: LocalCartItem;
}

export function CartItem({ item }: CartItemProps) {
  const { updateCartItem, removeFromCart } = useCart();
  
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(item.id);
    } else {
      await updateCartItem(item.id, newQuantity);
    }
  };

  // Safely get image URL from the item
  const getImageUrl = () => {
    if (!item.foodItem) return '/images/default.jpg';
    
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
  
  // Safely get food item name
  const getName = () => {
    if (!item.foodItem) return 'Food Item';
    
    if (typeof item.foodItem === 'object' && item.foodItem.name) {
      return item.foodItem.name;
    }
    
    return 'Food Item';
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative h-16 w-16 overflow-hidden rounded-lg">
        <Image
          src={getImageUrl()}
          alt={getName()}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="font-medium">{getName()}</h4>
        <p className="text-sm text-muted-foreground">
          ${item.price.toFixed(2)} × {item.quantity}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
          <span className="sr-only">Remove one item</span>
        </Button>
        <span className="w-4 text-center">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
          <span className="sr-only">Add one item</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => removeFromCart(item.id)}
        >
          <Trash className="h-3 w-3" />
          <span className="sr-only">Remove item</span>
        </Button>
      </div>
    </div>
  );
} 