'use client';

import { useState, useEffect } from 'react';
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
import { Order } from '@/lib/types/models';
import { useAuth } from '@/providers/auth-provider';
import { sellerApi } from '@/lib/api/seller';
import { useOrderMetricsStore } from '@/lib/store/orderMetricsStore';

const orderStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready for Pickup' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrderManagementPage() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  
  // Get seller ID from user data
  const sellerId = user ? (user as any).id : undefined;

  // Initialize the order metrics store
  const orderMetricsStore = useOrderMetricsStore();
  
  // Force rehydration of orderMetricsStore when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
      // Rehydrate the store
      useOrderMetricsStore.persist.rehydrate();
      
      // Recalculate metrics with a slight delay
      setTimeout(() => {
        orderMetricsStore.calculateMetrics();
      }, 300);
    }
  }, []);

  if (!sellerId) {
    console.error('Seller ID is undefined');
    toast({
      title: 'Error',
      description: 'Seller ID is required to fetch orders.',
      variant: 'destructive',
    });
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-muted-foreground">
              Please log in to view your orders
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fetch orders from API
  const { data: apiOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders', sellerId, selectedStatus],
    queryFn: async () => {
      try {
        const response = await sellerApi.getOrders();
        return response;
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
    },
  });
  
  // Get orders from local storage
  const localOrders = orderMetricsStore.orders.filter(order => {
    // Debug - log restaurant IDs for comparison
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Comparing order restaurantId '${order.restaurantId}' with sellerId '${sellerId}'`);
    }
    
    // If order has no restaurantId, skip it
    if (!order.restaurantId) return false;
    
    // Normalize restaurantId for comparison
    const orderRestaurantId = String(order.restaurantId || '').toLowerCase();
    const sellerIdStr = String(sellerId || '').toLowerCase();
    
    // Use more flexible matching to handle different ID formats
    return orderRestaurantId === sellerIdStr || 
           orderRestaurantId.includes(sellerIdStr) || 
           sellerIdStr.includes(orderRestaurantId) ||
           // Handle special MongoDB IDs
           (orderRestaurantId.length >= 12 && sellerIdStr.includes(orderRestaurantId.substring(0, 12))) ||
           (sellerIdStr.length >= 12 && orderRestaurantId.includes(sellerIdStr.substring(0, 12)));
  });
  
  // Add option to show all orders (for debugging purposes)
  const [showAllOrders, setShowAllOrders] = useState(false);
  
  // Combine orders, preferring API orders if they exist
  const combinedOrders: Order[] = apiOrders.length > 0 
    ? apiOrders 
    : showAllOrders 
      ? orderMetricsStore.orders as unknown as Order[]
      : localOrders as unknown as Order[];
  
  // Add debug function to log all order details
  const logOrderDetails = () => {
    console.log('All orders in store:', orderMetricsStore.orders);
    console.log('Current sellerId:', sellerId);
    console.log('Local orders after filtering:', localOrders);
    setShowAllOrders(!showAllOrders);
  };
  
  // Log available orders for debugging
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('API Orders:', apiOrders.length);
      console.log('Local Orders:', localOrders.length);
      console.log('Combined Orders:', combinedOrders.length);
    }
  }, [apiOrders, localOrders, combinedOrders]);

  // Update order status mutation
  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      // API update
      try {
        await sellerApi.updateOrderStatus(orderId, { 
          status: status as 'pending' | 'preparing' | 'out for delivery' | 'delivered'
        });
      } catch (error) {
        console.error('API update failed, updating local storage only');
      }
      
      // Also update in local storage
      orderMetricsStore.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
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

  // Filter orders based on search query and status
  const filteredOrders = combinedOrders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-500';
      case 'out_for_delivery':
      case 'on-the-way':
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

        <div className="flex justify-between items-center">
          <div className="flex-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logOrderDetails} 
              className="text-xs"
            >
              {showAllOrders ? "Show My Orders Only" : "Debug: Show All Orders"}
            </Button>
          </div>
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
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <h2 className="text-xl font-semibold">No orders found</h2>
              <p className="text-muted-foreground mt-2">
                {searchQuery || selectedStatus
                  ? 'Try adjusting your filters'
                  : 'You currently have no orders'}
              </p>
            </div>
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
                              ?.label || order.status
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
                        {order.items?.length || 0} items
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
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}