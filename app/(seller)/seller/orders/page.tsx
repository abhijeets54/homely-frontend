'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/ui/icons';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order } from '@/lib/types';

const orderStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready for Pickup' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrderManagementPage() {
  const { sellerId } = useParams(); // Assuming sellerId is passed as a route parameter
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!sellerId) {
    console.error('Seller ID is undefined');
    toast({
      title: 'Error',
      description: 'Seller ID is required to fetch orders.',
      variant: 'destructive',
    });
    return null; // Return null if sellerId is not available
  }

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders', sellerId, selectedStatus],
    queryFn: async () => {
      const response = await apiClient.get<Order[]>(`/api/seller/${sellerId}/orders`);
      return response.data;
    },
  });

  // Update order status mutation
  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
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

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-500';
      case 'out_for_delivery':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            View and manage all your orders in one place
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Orders</Label>
              <Input
                id="search"
                placeholder="Search by order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>Filter by Status</Label>
              <Select
                value={selectedStatus || ''}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Orders</SelectItem>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <Icons.inbox className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">No orders found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : selectedStatus
                  ? `No ${selectedStatus} orders found`
                  : 'No orders to display'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Order #{order.id}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {
                            orderStatuses.find((s) => s.value === order.status)
                              ?.label
                          }
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(order.totalPrice)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        // TODO: Implement order details expansion
                      }}
                    >
                      <Icons.chevronRight className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Update Status</Label>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          updateOrderStatus({
                            orderId: order.id,
                            status: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map((status) => (
                            <SelectItem
                              key={status.value}
                              value={status.value}
                              disabled={
                                status.value === 'cancelled' &&
                                order.status === 'delivered'
                              }
                            >
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Delivery Address
                          </span>
                        </div>
                        <p className="text-sm">{order.deliveryAddress}</p>
                        {order.specialInstructions && (
                          <p className="text-sm text-muted-foreground">
                            Note: {order.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Order Items</Label>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg bg-muted p-2"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}