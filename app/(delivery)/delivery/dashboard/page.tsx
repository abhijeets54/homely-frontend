'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { useAuth } from '@/providers/auth-provider';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { deliveryApi } from '@/lib/api/delivery';
import {
  Bike,
  Package,
  Clock,
  CheckCircle2,
  DollarSign,
  MapPin,
  User,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export default function DeliveryDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const queryClient = useQueryClient();
  
  // Fetch available orders
  const { 
    data: availableOrders = [], 
    isLoading: availableOrdersLoading,
    error: availableOrdersError,
    refetch: refetchAvailableOrders
  } = useQuery({
    queryKey: ['available-orders'],
    queryFn: async () => {
      try {
        return await deliveryApi.getAvailableOrders();
      } catch (error) {
        console.error('Error fetching available orders:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // Fetch active deliveries
  const { 
    data: activeDeliveries = [], 
    isLoading: activeDeliveriesLoading,
    error: activeDeliveriesError,
    refetch: refetchActiveDeliveries
  } = useQuery({
    queryKey: ['active-deliveries'],
    queryFn: async () => {
      try {
        return await deliveryApi.getActiveDeliveries();
      } catch (error) {
        console.error('Error fetching active deliveries:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // Fetch delivery history
  const { 
    data: deliveryHistory = [], 
    isLoading: deliveryHistoryLoading,
    error: deliveryHistoryError,
    refetch: refetchDeliveryHistory
  } = useQuery({
    queryKey: ['delivery-history'],
    queryFn: async () => {
      try {
        return await deliveryApi.getDeliveryHistory();
      } catch (error) {
        console.error('Error fetching delivery history:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // Fetch earnings
  const { 
    data: earnings, 
    isLoading: earningsLoading,
    error: earningsError
  } = useQuery({
    queryKey: ['delivery-earnings'],
    queryFn: async () => {
      try {
        return await deliveryApi.getEarnings();
      } catch (error) {
        console.error('Error fetching earnings:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // Accept delivery mutation
  const acceptDeliveryMutation = useMutation({
    mutationFn: (orderId: string) => deliveryApi.acceptDelivery(orderId),
    onSuccess: () => {
      toast({
        title: "Delivery Accepted",
        description: "You have successfully accepted this delivery.",
      });
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
      queryClient.invalidateQueries({ queryKey: ['active-deliveries'] });
      setActiveTab('active');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to accept delivery: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Update delivery status mutation
  const updateDeliveryStatusMutation = useMutation({
    mutationFn: ({ deliveryId, status }: { deliveryId: string, status: string }) => 
      deliveryApi.updateDeliveryStatus(deliveryId, status),
    onSuccess: (data, variables) => {
      toast({
        title: "Status Updated",
        description: `Delivery status updated to ${variables.status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['active-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-history'] });
      
      if (variables.status === 'delivered') {
        setActiveTab('history');
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Handle accepting a delivery
  const handleAcceptDelivery = (orderId: string) => {
    acceptDeliveryMutation.mutate(orderId);
  };

  // Handle updating delivery status
  const handleUpdateDeliveryStatus = (deliveryId: string, newStatus: string) => {
    updateDeliveryStatusMutation.mutate({ deliveryId, newStatus });
  };

  // Loading state
  const isLoading = authLoading || availableOrdersLoading || activeDeliveriesLoading || deliveryHistoryLoading || earningsLoading;

  // Error state
  const hasError = availableOrdersError || activeDeliveriesError || deliveryHistoryError || earningsError;

  if (!isAuthenticated && !authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">Please log in to view your delivery dashboard.</p>
            <Button asChild>
              <Link href="/login?userType=delivery">Login</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Delivery Dashboard</h1>
            <p className="text-gray-600">Manage your deliveries and track earnings</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild>
              <Link href="/delivery/profile">View Profile</Link>
            </Button>
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Earnings</p>
                  <h3 className="text-2xl font-bold mt-1">₹{earnings?.today?.toFixed(2) || '0.00'}</h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Weekly Earnings</p>
                  <h3 className="text-2xl font-bold mt-1">₹{earnings?.weekly?.toFixed(2) || '0.00'}</h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                  <h3 className="text-2xl font-bold mt-1">₹{earnings?.total?.toFixed(2) || '0.00'}</h3>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="available">Available Orders</TabsTrigger>
            <TabsTrigger value="active">Active Deliveries</TabsTrigger>
            <TabsTrigger value="history">Delivery History</TabsTrigger>
          </TabsList>
          
          {/* Available Orders Tab */}
          <TabsContent value="available">
            {hasError ? (
              <Card>
                <CardHeader>
                  <CardTitle>Error Loading Data</CardTitle>
                  <CardDescription>
                    We encountered an error while loading the available orders. Please try again.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => refetchAvailableOrders()}>Retry</Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="space-y-4">
                {availableOrders.length === 0 ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-6">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Available Orders</h3>
                        <p className="text-gray-500">There are no orders available for pickup at the moment.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  availableOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <Package className="h-5 w-5 mr-2 text-primary" />
                              <h3 className="font-medium">Order #{order.id.substring(0, 8)}</h3>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>Pickup: {order.restaurant?.address || 'Restaurant address'}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>Delivery: {order.deliveryAddress}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>Earnings: ₹{(order.deliveryFee || 50).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <Button 
                              onClick={() => handleAcceptDelivery(order.id)}
                              disabled={acceptDeliveryMutation.isPending}
                            >
                              {acceptDeliveryMutation.isPending ? 'Accepting...' : 'Accept Delivery'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Active Deliveries Tab */}
          <TabsContent value="active">
            {hasError ? (
              <Card>
                <CardHeader>
                  <CardTitle>Error Loading Data</CardTitle>
                  <CardDescription>
                    We encountered an error while loading your active deliveries. Please try again.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => refetchActiveDeliveries()}>Retry</Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeDeliveries.length === 0 ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-6">
                        <Bike className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Active Deliveries</h3>
                        <p className="text-gray-500">You don't have any active deliveries at the moment.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  activeDeliveries.map((delivery) => (
                    <Card key={delivery.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <Bike className="h-5 w-5 mr-2 text-primary" />
                              <h3 className="font-medium">Delivery #{delivery.id.substring(0, 8)}</h3>
                              <Badge className="ml-2" variant={delivery.status === 'assigned' ? 'outline' : 'default'}>
                                {delivery.status === 'assigned' ? 'Pickup' : 'In Transit'}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <User className="h-4 w-4 mr-1" />
                              <span>Customer: {delivery.order?.customer?.name || 'Customer'}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>Delivery Address: {delivery.order?.deliveryAddress || 'Address'}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Assigned: {formatDate(delivery.createdAt)}</span>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0">
                            {delivery.status === 'assigned' ? (
                              <Button 
                                onClick={() => handleUpdateDeliveryStatus(delivery.id, 'picked up')}
                                disabled={updateDeliveryStatusMutation.isPending}
                              >
                                {updateDeliveryStatusMutation.isPending ? 'Updating...' : 'Mark as Picked Up'}
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleUpdateDeliveryStatus(delivery.id, 'delivered')}
                                disabled={updateDeliveryStatusMutation.isPending}
                              >
                                {updateDeliveryStatusMutation.isPending ? 'Updating...' : 'Mark as Delivered'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Delivery History Tab */}
          <TabsContent value="history">
            {hasError ? (
              <Card>
                <CardHeader>
                  <CardTitle>Error Loading Data</CardTitle>
                  <CardDescription>
                    We encountered an error while loading your delivery history. Please try again.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => refetchDeliveryHistory()}>Retry</Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="space-y-4">
                {deliveryHistory.length === 0 ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-6">
                        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Delivery History</h3>
                        <p className="text-gray-500">You haven't completed any deliveries yet.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  deliveryHistory.map((delivery) => (
                    <Card key={delivery.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                              <h3 className="font-medium">Delivery #{delivery.id.substring(0, 8)}</h3>
                              <Badge className="ml-2" variant="outline">Completed</Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <User className="h-4 w-4 mr-1" />
                              <span>Customer: {delivery.order?.customer?.name || 'Customer'}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>Delivery Address: {delivery.order?.deliveryAddress || 'Address'}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Delivered: {formatDate(delivery.updatedAt || delivery.createdAt)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>Earnings: ₹{(delivery.order?.deliveryFee || 50).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 