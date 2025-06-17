'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash } from 'lucide-react';
import { useCart } from '@/components/providers/cart-provider';
import { CartItem as CartItemType } from '@/lib/types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateCartItem, removeFromCart } = useCart();

  const handleQuantityDecrease = () => {
    if (item.quantity > 1) {
      updateCartItem(item.id, item.quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    updateCartItem(item.id, item.quantity + 1);
  };

  const handleRemoveItem = () => {
    removeFromCart(item.id);
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative h-16 w-16 overflow-hidden rounded-lg">
        <Image
          src={item.foodItem.image}
          alt={item.foodItem.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="font-medium">{item.foodItem.name}</h4>
        <p className="text-sm text-muted-foreground">
          ${item.price.toFixed(2)} × {item.quantity}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleQuantityDecrease}
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
          onClick={handleQuantityIncrease}
        >
          <Plus className="h-3 w-3" />
          <span className="sr-only">Add one item</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleRemoveItem}
        >
          <Trash className="h-3 w-3" />
          <span className="sr-only">Remove item</span>
        </Button>
      </div>
    </div>
  );
} 