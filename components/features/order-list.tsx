'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icons } from '@/components/ui/icons';
import { useRouter } from 'next/navigation';

interface OrderListProps {
  orders: Order[];
  isLoading?: boolean;
}

const orderStatusColors = {
  pending: 'bg-yellow-500',
  preparing: 'bg-blue-500',
  'out for delivery': 'bg-purple-500',
  delivered: 'bg-green-500',
};

export default function OrderList({ orders, isLoading }: OrderListProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const router = useRouter();

  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-4 text-center">
        <Icons.order className="h-12 w-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm text-muted-foreground">
            When you place orders, they will appear here.
          </p>
        </div>
        <Button asChild>
          <Link href="/sellers">Browse Sellers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card
          key={order.id}
          className="overflow-hidden transition-all hover:shadow-md"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), 'PPp')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  className={`${
                    orderStatusColors[order.status as keyof typeof orderStatusColors]
                  } text-white`}
                >
                  {order.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setExpandedOrderId(
                      expandedOrderId === order.id ? null : order.id
                    )
                  }
                >
                  <Icons.chevronDown
                    className={`h-4 w-4 transition-transform ${
                      expandedOrderId === order.id ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </div>
            </div>
            {expandedOrderId === order.id && (
              <div className="mt-4 border-t pt-4">
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm font-medium">Order Items</p>
                    <ul className="mt-2 space-y-2">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {item.quantity}x {item.foodItem?.name}
                          </span>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <p>
                      <span className="font-medium">Delivery Address:</span>{' '}
                      {order.deliveryAddress}
                    </p>
                    {order.specialInstructions && (
                      <p>
                        <span className="font-medium">Special Instructions:</span>{' '}
                        {order.specialInstructions}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                    {order.status === 'delivered' && (
                      <Button size="sm">Leave Review</Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}