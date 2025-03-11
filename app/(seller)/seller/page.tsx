'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderList } from '@/components/features/order-list';
import { MenuManager } from '@/components/features/menu-manager';
import { AnalyticsDashboard } from '@/components/features/analytics-dashboard';
import { useAuth } from '@/lib/hooks/use-auth';
import { Icons } from '@/components/ui/icons';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const seller = user as any; // TODO: Type this properly when backend is ready

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => [], // TODO: Implement when backend is ready
  });

  const { data: menuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ['seller-menu'],
    queryFn: () => [], // TODO: Implement when backend is ready
  });

  const { data: analytics = {}, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['seller-analytics'],
    queryFn: () => ({
      totalOrders: 0,
      totalRevenue: 0,
      averageRating: 0,
      activeOrders: 0,
    }), // TODO: Implement when backend is ready
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <div className="flex items-center gap-2">
              <Switch id="store-status" />
              <Label htmlFor="store-status">Store {seller?.status}</Label>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Icons.order className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  +20% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <Icons.dollar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics.totalRevenue?.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Icons.star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.averageRating?.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">Based on 50 reviews</p>
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
                <div className="text-2xl font-bold">{analytics.activeOrders}</div>
                <p className="text-xs text-muted-foreground">
                  2 pending acceptance
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Active Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Orders</CardTitle>
                <CardDescription>
                  Manage your current orders and update their status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderList orders={orders} isLoading={isLoadingOrders} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>
                  Add, edit, or remove items from your menu.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MenuManager items={menuItems} isLoading={isLoadingMenu} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  View your business performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsDashboard
                  data={analytics}
                  isLoading={isLoadingAnalytics}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 