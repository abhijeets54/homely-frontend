'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/auth-provider';
import { sellerApi } from '@/lib/api/seller';
import { formatPrice } from '@/lib/utils/format';
import { ShoppingBag, Clock, CheckCircle, CreditCard, Package, Star } from 'lucide-react';

export default function SellerDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  
  // Fetch dashboard stats
  const { 
    data: stats, 
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: () => sellerApi.getDashboardStats(),
    enabled: isAuthenticated,
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Error fetching dashboard stats:', error);
    }
  });

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to view your dashboard.</p>
            <Button asChild>
              <Link href="/login?userType=seller">Login</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Restaurant Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <Badge variant={user?.status === 'open' ? 'success' : 'destructive'} className="text-sm py-1 px-3">
              {user?.status === 'open' ? 'Open' : 'Closed'}
            </Badge>
            <Button asChild>
              <Link href="/seller/menu">Manage Menu</Link>
            </Button>
          </div>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : statsError ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Backend Implementation Missing</CardTitle>
              <CardDescription>
                The seller dashboard API is not properly implemented in the backend. This is a critical feature that needs to be addressed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-500 mb-4">Error details: {(statsError as Error).message}</p>
              <p className="text-sm text-gray-500 mb-4">
                The dashboard cannot display statistics until the backend endpoint is properly implemented. 
                Please refer to the miss.md file for implementation details.
              </p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <h3 className="font-medium text-amber-800 mb-2">Required Implementation:</h3>
                <p className="text-sm text-amber-700">
                  The backend needs to implement the <code>/api/seller/dashboard</code> endpoint that returns statistics 
                  including total orders, revenue, and order status counts. Check miss.md for the complete data structure.
                </p>
                <p className="text-sm text-amber-700 mt-2">
                  <strong>Note:</strong> The frontend has been updated to use <code>/api/seller?view=dashboard</code> instead of 
                  <code>/api/seller/dashboard</code> to work around the MongoDB ObjectId casting error. The backend should 
                  handle this query parameter appropriately.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => refetchStats()}>Retry</Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <h3 className="text-2xl font-bold mt-1">{stats?.totalOrders || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <h3 className="text-2xl font-bold mt-1">₹{formatPrice(stats?.totalRevenue || 0)}</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Menu Items</p>
                    <h3 className="text-2xl font-bold mt-1">{stats?.totalMenuItems || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rating</p>
                    <h3 className="text-2xl font-bold mt-1 flex items-center">
                      {user?.rating || 'New'} 
                      {user?.rating && <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
              <CardDescription>Current order distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                  ))}
                </div>
              ) : statsError ? (
                <p className="text-red-500">Error loading order statistics</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span>Pending</span>
                    </div>
                    <span className="font-medium">{stats?.ordersByStatus?.pending || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>Preparing</span>
                    </div>
                    <span className="font-medium">{stats?.ordersByStatus?.preparing || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      <span>Out for Delivery</span>
                    </div>
                    <span className="font-medium">{stats?.ordersByStatus?.delivering || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Completed</span>
                    </div>
                    <span className="font-medium">{stats?.ordersByStatus?.completed || 0}</span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/seller/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your most recent orders</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : statsError ? (
                <p className="text-red-500">Error loading recent orders</p>
              ) : stats?.recentOrders?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentOrders.map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-gray-500">{order.customer?.name || 'Customer'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{formatPrice(order.totalPrice)}</p>
                        <Badge variant="outline" className="capitalize">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/seller/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
            <CardDescription>Your most ordered menu items</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : statsError ? (
              <p className="text-red-500">Error loading popular items</p>
            ) : stats?.popularItems?.length > 0 ? (
              <div className="space-y-4">
                {stats.popularItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">₹{formatPrice(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.orderCount} orders</p>
                      <p className="text-sm text-gray-500">₹{formatPrice(item.totalRevenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No order data available</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/seller/menu">Manage Menu</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
} 