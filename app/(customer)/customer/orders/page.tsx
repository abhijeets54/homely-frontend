'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { useOrders } from '@/lib/api';
import { Order } from '@/lib/types/models';
import { formatDate } from '@/lib/utils/format';
import { ShoppingBag, Clock, MapPin, CreditCard, ChevronRight } from 'lucide-react';

export default function OrdersPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Orders query
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useOrders(user?.id || '', 'customer');

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'out for delivery':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get payment status badge color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'refunded':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to view your orders.</p>
            <Button asChild>
              <Link href="/login?userType=customer">Login</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

        {ordersLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        ) : ordersError ? (
          <Card className="p-6 text-center">
            <CardTitle className="text-red-500 mb-2">Error Loading Orders</CardTitle>
            <CardDescription>
              We encountered an error while loading your orders. Please try again later.
            </CardDescription>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="p-6 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <CardTitle className="mb-2">No Orders Yet</CardTitle>
            <CardDescription className="mb-6">
              You haven't placed any orders yet. Start shopping to place your first order.
            </CardDescription>
            <Button asChild>
              <Link href="/restaurants">Browse Restaurants</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order: Order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        Placed on {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <ShoppingBag className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {order.restaurant?.name || 'Restaurant'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                      <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                    </div>
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                      <p className="text-sm text-gray-600">
                        Total: ₹{order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    {order.specialInstructions && (
                      <div className="text-sm text-gray-600 italic">
                        <span className="font-medium">Special Instructions:</span> {order.specialInstructions}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {order.status === 'delivered' ? 'Delivered' : 'Estimated delivery'}: 30-45 min
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/customer/orders/${order.id}`}>
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 