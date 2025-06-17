'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import { sellerApi } from '@/lib/api/seller';
import { formatPrice } from '@/lib/utils/format';
import { ShoppingBag, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { useOrderMetricsStore } from '@/lib/store/orderMetricsStore';

export default function SellerDashboardPage() {
  const { user, role, isAuthenticated, isInitializing } = useAuth();
  
  // State to track if the component is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  // Initialize the order metrics store but don't destructure the functions
  const orderMetricsStore = useOrderMetricsStore();
  
  // Get restaurant ID from user data
  const restaurantId = user ? (user as any).id || (user as any)._id || 'default-restaurant' : 'default-restaurant';
  
  // Log restaurant ID for debugging
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Seller Dashboard - Restaurant ID:', restaurantId);
      console.log('Full user object:', user);
    }
  }, [user, restaurantId]);
  
  // Get metrics from local storage directly with useMemo to prevent unnecessary recalculations
  const localMetrics = React.useMemo(() => {
    if (!isMounted) return orderMetricsStore.getSellerMetrics(restaurantId);
    
    // Try to get metrics with the exact restaurantId
    const exactMatch = orderMetricsStore.getSellerMetrics(restaurantId);
    
    // If we have metrics, return them
    if (exactMatch.totalOrders > 0) {
      console.log('Found metrics for restaurant ID:', restaurantId);
      return exactMatch;
    }
    
    // If we don't have exact metrics, try to debug and find orders
    console.log('No metrics found for restaurant ID:', restaurantId);
    
    // Get all available seller metrics to check restaurant IDs
    const allMetrics = orderMetricsStore.sellerMetrics;
    console.log('Available restaurant IDs in metrics:', Object.keys(allMetrics));
    
    // Log all orders to check their restaurant IDs
    const allOrders = orderMetricsStore.orders;
    console.log('All orders count:', allOrders.length);
    console.log('Order restaurant IDs:', allOrders.map(order => order.restaurantId));
    
    // Try finding a valid match by checking for a partial match in the keys
    for (const key in allMetrics) {
      if (key.includes(restaurantId) || restaurantId.includes(key)) {
        console.log('Found possible match:', key);
        return allMetrics[key];
      }
    }
    
    // If still no metrics found, try to manually filter orders for this seller
    if (allOrders.length > 0) {
      console.log('Attempting to manually filter orders for seller:', restaurantId);
      
      // Filter orders that belong to this seller
      const sellerOrders = allOrders.filter(order => {
        const orderRestaurantId = String(order.restaurantId || '').toLowerCase();
        const sellerIdStr = String(restaurantId || '').toLowerCase();
        
        // Check restaurantInfo object
        let restaurantInfoId = '';
        if (order.restaurantInfo) {
          if (typeof order.restaurantInfo === 'object') {
            restaurantInfoId = String(order.restaurantInfo.id || order.restaurantInfo._id || '').toLowerCase();
          }
        }
        
        // Check for match using all possible formats
        return orderRestaurantId === sellerIdStr || 
               orderRestaurantId.includes(sellerIdStr) || 
               sellerIdStr.includes(orderRestaurantId) ||
               (restaurantInfoId && (restaurantInfoId === sellerIdStr || 
                                    restaurantInfoId.includes(sellerIdStr) || 
                                    sellerIdStr.includes(restaurantInfoId)));
      });
      
      console.log('Manually filtered seller orders:', sellerOrders.length);
      
      if (sellerOrders.length > 0) {
        // Calculate metrics manually
        const totalOrders = sellerOrders.length;
        const pendingOrders = sellerOrders.filter(o => 
          ['pending', 'preparing', 'on-the-way', 'out for delivery'].includes(o.status.toLowerCase())
        ).length;
        const completedOrders = sellerOrders.filter(o => 
          o.status.toLowerCase() === 'delivered'
        ).length;
        const totalRevenue = sellerOrders
          .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
          
        // Calculate popular items
        const itemCounts: Record<string, number> = {};
        sellerOrders.forEach(order => {
          if (Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const itemName = item.name || 'Unknown Item';
              itemCounts[itemName] = (itemCounts[itemName] || 0) + (Number(item.quantity) || 1);
            });
          }
        });
          
        // Convert to array and sort
        const popularItems = Object.entries(itemCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => Number(b.count) - Number(a.count))
          .slice(0, 5);
          
        // Get recent orders (last 5)
        const recentOrders = [...sellerOrders]
          .sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);
        
        console.log('Returning manually calculated metrics for seller:', restaurantId);
        return {
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
          popularItems,
          recentOrders
        };
      }
    }
    
    return exactMatch;
  }, [orderMetricsStore, restaurantId, isMounted]); // Re-compute when component mounts
  
  // Ensure metrics are hydrated and refreshed when component mounts
  useEffect(() => {
    // Make sure Zustand is hydrated
    if (typeof window !== 'undefined') {
      // Initialize the component
      setIsMounted(true);
      
      // Force rehydration of the store
      useOrderMetricsStore.persist.rehydrate();
      
      // Calculate metrics with a slight delay to ensure store is ready
      const timer = setTimeout(() => {
        console.log('Recalculating seller dashboard metrics');
        orderMetricsStore.calculateMetrics();
        
        // Log orders for this seller in development mode
        if (process.env.NODE_ENV !== 'production') {
          const allOrders = orderMetricsStore.orders;
          const filteredOrders = allOrders.filter(order => {
            const orderRestaurantId = String(order.restaurantId || '').toLowerCase();
            const sellerIdStr = String(restaurantId || '').toLowerCase();
            
            // Check for match using all possible formats
            return orderRestaurantId === sellerIdStr || 
                   orderRestaurantId.includes(sellerIdStr) || 
                   sellerIdStr.includes(orderRestaurantId);
          });
          
          console.log(`Found ${filteredOrders.length} orders for seller ${restaurantId} out of ${allOrders.length} total orders`);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [restaurantId]); // Include restaurantId in dependencies to recalculate if it changes
  
  // Fetch dashboard stats from API as a fallback
  const { 
    data: apiStats, 
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: () => sellerApi.getDashboardStats(),
    enabled: isAuthenticated,
  });
  
  // Combine API stats with local metrics, preferring API if available
  const stats = apiStats || localMetrics;

  // Debug metrics to console
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Seller Dashboard Metrics:', { 
        restaurantId,
        apiStats,
        localMetrics,
        finalStats: stats
      });
    }
  }, [apiStats, localMetrics, stats, restaurantId]);

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
            <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild>
              <Link href="/seller/menu">Manage Menu</Link>
            </Button>
          </div>
        </div>

        {statsLoading ? (
          <div className="mb-8">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : statsError ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Error Loading Dashboard</CardTitle>
              <CardDescription>
                We encountered an error while loading your dashboard statistics.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardFooter>
          </Card>
        ) : null}

        {/* Popular Items Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
            <CardDescription>Your most ordered items</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : statsError && !localMetrics.popularItems.length ? (
              <p className="text-red-500">Error loading popular items</p>
            ) : (stats?.popularItems || localMetrics.popularItems)?.length > 0 ? (
              <div className="space-y-4">
                {(stats?.popularItems || localMetrics.popularItems).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Ordered {item.count} times</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No popular items data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your restaurant's most recent orders</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : statsError && !localMetrics.recentOrders?.length ? (
              <p className="text-red-500">Error loading recent orders</p>
            ) : (stats?.recentOrders || localMetrics.recentOrders)?.length > 0 ? (
              <div className="space-y-4">
                {(stats?.recentOrders || localMetrics.recentOrders).map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">Order #{typeof order.id === 'string' ? order.id.substring(0, 8) : 'N/A'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {order.items.map((item: any) => item.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.totalPrice || 0)}</p>
                      <p className="text-sm text-gray-500 capitalize">{order.status || 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            {process.env.NODE_ENV !== 'production' && (
              <p className="text-xs text-gray-400 text-center">
                Orders are fetched from local storage and filtered by your seller ID
              </p>
            )}
          </CardFooter>
        </Card>


      </div>
    </MainLayout>
  );
}
