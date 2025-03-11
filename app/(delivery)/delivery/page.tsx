'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryOrderList } from '@/components/features/delivery/delivery-order-list';
import { DeliveryMap } from '@/components/features/delivery/delivery-map';
import { useAuth } from '@/lib/hooks/use-auth';
import { Icons } from '@/components/ui/icons';
import { Order, DeliveryAssignment } from '@/lib/types';

export default function DeliveryDashboardPage() {
  const { user } = useAuth();

  const { data: activeDeliveries = [], isLoading: isLoadingActive } = useQuery<DeliveryAssignment[]>({
    queryKey: ['active-deliveries'],
    queryFn: async () => {
      // TODO: Implement API call
      return [];
    },
  });

  const { data: availableOrders = [], isLoading: isLoadingAvailable } = useQuery<Order[]>({
    queryKey: ['available-orders'],
    queryFn: async () => {
      // TODO: Implement API call
      return [];
    },
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
                <Icons.package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeDeliveries.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeDeliveries.filter(d => d.status === 'picked up').length} in transit
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Orders</CardTitle>
                <Icons.bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableOrders.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for pickup
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
                <Icons.dollar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹500</div>
                <p className="text-xs text-muted-foreground">
                  +₹100 from yesterday
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Content */}
        <Tabs defaultValue="map" className="space-y-4">
          <TabsList>
            <TabsTrigger value="map">Live Map</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <DeliveryMap
                  activeDeliveries={activeDeliveries}
                  availableOrders={availableOrders}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryOrderList
                  orders={activeDeliveries}
                  isLoading={isLoadingActive}
                  type="active"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Available Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryOrderList
                  orders={availableOrders}
                  isLoading={isLoadingAvailable}
                  type="available"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 