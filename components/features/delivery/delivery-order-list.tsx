'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order, DeliveryAssignment } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface DeliveryOrderListProps {
  orders: (Order | DeliveryAssignment)[];
  isLoading: boolean;
  type: 'active' | 'available';
}

// Export both named and default for compatibility
export function DeliveryOrderList({
  orders,
  isLoading,
  type,
}: DeliveryOrderListProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleOrderSelect = (orderId: string) => {
    router.push(`/delivery/orders/${orderId}`);
  };

  const { mutate: updateOrderStatus, isLoading: isUpdating } = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['active-deliveries']);
      queryClient.invalidateQueries(['available-orders']);
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    },
  });

  const { mutate: acceptOrder, isLoading: isAccepting } = useMutation({
    mutationFn: async (orderId: string) => {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['active-deliveries']);
      queryClient.invalidateQueries(['available-orders']);
      toast({
        title: 'Success',
        description: 'Order accepted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to accept order',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {type === 'active'
            ? 'No active deliveries'
            : 'No available orders'}
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'picked up':
        return 'bg-blue-500';
      case 'delivered':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Order #{order.id}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge
              className={getStatusColor(
                'status' in order ? order.status : 'pending'
              )}
            >
              {'status' in order ? order.status : 'Available'}
            </Badge>
          </div>

          <div className="mt-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() =>
                setExpandedOrderId(
                  expandedOrderId === order.id ? null : order.id
                )
              }
            >
              <Icons.chevronRight
                className={`mr-2 h-4 w-4 transition-transform ${
                  expandedOrderId === order.id ? 'rotate-90' : ''
                }`}
              />
              {expandedOrderId === order.id ? 'Hide' : 'View'} Details
            </Button>
          </div>

          {expandedOrderId === order.id && (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Delivery Details</p>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm">
                    {order.deliveryAddress}
                  </p>
                  {order.specialInstructions && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Note: {order.specialInstructions}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Order Summary</p>
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Amount</span>
                    <span className="text-sm font-medium">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {type === 'available' ? (
                <Button
                  className="w-full"
                  onClick={() => acceptOrder(order.id)}
                  disabled={isAccepting}
                >
                  {isAccepting && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Accept Order
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() =>
                      updateOrderStatus({
                        orderId: order.id,
                        status:
                          'status' in order && order.status === 'assigned'
                            ? 'picked up'
                            : 'delivered',
                      })
                    }
                    disabled={isUpdating}
                  >
                    {isUpdating && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {'status' in order && order.status === 'assigned'
                      ? 'Mark as Picked Up'
                      : 'Mark as Delivered'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// Add default export for backwards compatibility
export default DeliveryOrderList;