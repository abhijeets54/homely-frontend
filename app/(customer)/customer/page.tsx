'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderList } from '@/components/features/order-list';
import { FavoriteSellersList } from '@/components/features/favorite-sellers-list';
import { useAuth } from '@/lib/hooks/use-auth';
import { Icons } from '@/components/ui/icons';

export default function CustomerDashboardPage() {
  const { user } = useAuth();

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => [], // TODO: Implement when backend is ready
  });

  const { data: favoriteSellers = [], isLoading: isLoadingSellers } = useQuery({
    queryKey: ['favorite-sellers'],
    queryFn: () => [], // TODO: Implement when backend is ready
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
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Icons.order className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 orders this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Favorite Sellers
                </CardTitle>
                <Icons.heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{favoriteSellers.length}</div>
                <p className="text-xs text-muted-foreground">
                  +1 new this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Orders
                </CardTitle>
                <Icons.clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter((order) => order.status !== 'delivered').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  2 out for delivery
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="favorites">Favorite Sellers</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Your order history from the past 30 days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderList orders={orders} isLoading={isLoadingOrders} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Sellers</CardTitle>
                <CardDescription>
                  Your favorite home chefs and restaurants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FavoriteSellersList
                  sellers={favoriteSellers}
                  isLoading={isLoadingSellers}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 