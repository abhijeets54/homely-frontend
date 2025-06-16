'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Order, DeliveryAssignment } from '@/lib/types';

interface DeliveryMapProps {
  activeDeliveries: DeliveryAssignment[];
  availableOrders: Order[];
}

export function DeliveryMap({ activeDeliveries, availableOrders }: DeliveryMapProps) {
  return (
    <Card className="w-full h-[500px] overflow-auto">
      <CardHeader>
        <CardTitle>Delivery Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activeDeliveries.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Active Deliveries</h3>
              {activeDeliveries.map((delivery) => (
                <div key={delivery.orderId} className="p-4 border rounded-md bg-blue-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Order #{delivery.orderId}</p>
                      <p className="text-sm text-gray-500">Status: {delivery.status}</p>
                    </div>
                    <Button size="sm">Navigate</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No active deliveries at the moment.</p>
          )}

          {availableOrders.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Available Orders</h3>
              {availableOrders.map((order) => (
                <div key={order.id} className="p-4 border rounded-md bg-red-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">Available for pickup</p>
                    </div>
                    <Button size="sm" variant="outline">Accept</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeDeliveries.length === 0 && availableOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No deliveries or orders available at the moment.</p>
              <p className="text-sm mt-2">Check back later or refresh the page.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 