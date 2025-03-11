'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sellerApi } from '@/lib/api';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { useAuthContext } from '@/providers/auth-provider';
import { useAuth } from '@/lib/context/auth-context';
import { useOrders, useDeliveryAssignment } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  ChefHat,
  Bike,
  CheckCircle2,
  MapPin,
  Phone,
  Receipt,
  AlertCircle,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import { useParams } from 'next/navigation';

type OrderDetailPageProps = {
  params: {
    orderId: string;
  };
};

const orderStatuses = {
  pending: {
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    label: 'Order Pending',
  },
  preparing: {
    icon: ChefHat,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    label: 'Preparing Order',
  },
  'out for delivery': {
    icon: Bike,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    label: 'Out for Delivery',
  },
  delivered: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-50',
    label: 'Delivered',
  },
};

export default function SellerOrderPage() {
  const { orderId } = useParams(); // Ensure using orderId, not id
  const { user } = useAuth();
  const { data: orders } = useOrders(user?.id || '', 'seller');
  const { toast } = useToast();
  const order = orders?.find((o) => o.id === orderId);
  const { data: delivery } = useDeliveryAssignment(orderId);

  const currentStatus = order?.status || 'pending';
  const StatusIcon = orderStatuses[currentStatus]?.icon || AlertCircle;

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      // Implement status update when backend is ready
      toast({
        title: 'Status updated',
        description: `Order status has been updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  if (!order) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/seller/orders">
              <span className="mr-2">←</span> Back to Orders
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        {/* Order Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div
              className={`flex items-center justify-center p-6 rounded-lg ${
                orderStatuses[currentStatus]?.bg
              }`}
            >
              <StatusIcon
                className={`h-12 w-12 ${orderStatuses[currentStatus]?.color}`}
              />
              <div className="ml-6">
                <h2 className="text-2xl font-semibold">
                  {orderStatuses[currentStatus]?.label}
                </h2>
                <p className="text-muted-foreground">
                  {delivery?.estimatedDeliveryTime
                    ? `Estimated delivery by ${new Date(
                        delivery.estimatedDeliveryTime
                      ).toLocaleTimeString()}`
                    : 'Calculating delivery time...'}
                </p>
              </div>
            </div>

            {/* Status Update Buttons */}
            <div className="mt-6 flex flex-wrap gap-4">
              {Object.entries(orderStatuses).map(([status, info]) => (
                <Button
                  key={status}
                  variant={currentStatus === status ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus(status)}
                  disabled={currentStatus === status}
                  className="flex-1"
                >
                  <info.icon className="h-4 w-4 mr-2" />
                  Mark as {info.label}
                </Button>
              ))}
            </div>

            {/* Progress Steps */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute left-0 top-2 w-full h-0.5 bg-gray-200" />
                <div
                  className="absolute left-0 top-2 h-0.5 bg-primary transition-all duration-500"
                  style={{
                    width:
                      currentStatus === 'pending'
                        ? '0%'
                        : currentStatus === 'preparing'
                        ? '33%'
                        : currentStatus === 'out for delivery'
                        ? '66%'
                        : '100%',
                  }}
                />
                <div className="relative flex justify-between">
                  {Object.entries(orderStatuses).map(([status, info], index) => {
                    const Icon = info.icon;
                    const isActive =
                      Object.keys(orderStatuses).indexOf(currentStatus) >=
                      Object.keys(orderStatuses).indexOf(status);
                    return (
                      <div
                        key={status}
                        className="flex flex-col items-center space-y-2"
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${
                            isActive
                              ? 'bg-primary border-primary'
                              : 'bg-gray-200 border-gray-200'
                          } border-2 transition-colors duration-200`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isActive ? 'text-primary' : 'text-gray-500'
                          }`}
                        >
                          {info.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start space-x-4">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Customer Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Name: {order.customer?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {order.customer?.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Delivery Address</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        {delivery && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                {delivery.deliveryPartner && (
                  <div className="flex items-start space-x-4">
                    <Bike className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Delivery Partner</h3>
                      <p className="text-sm text-muted-foreground">
                        {delivery.deliveryPartner.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 inline mr-1" />
                        {delivery.deliveryPartner.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-4">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Estimated Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      {delivery.estimatedDeliveryTime
                        ? new Date(
                            delivery.estimatedDeliveryTime
                          ).toLocaleTimeString()
                        : 'Calculating...'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Order Items */}
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 py-2 border-b last:border-0"
                  >
                    <div className="relative h-16 w-16 rounded overflow-hidden">
                      <Image
                        src={item.foodItem?.imageUrl || '/images/placeholder.jpg'}
                        alt={item.foodItem?.name || 'Food item'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.foodItem?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>$5.00</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total</span>
                  <span>${(order.totalPrice + 5).toFixed(2)}</span>
                </div>
              </div>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Receipt className="h-4 w-4 mr-2" />
                    Special Instructions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {order.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}