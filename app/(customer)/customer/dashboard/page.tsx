'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import { customerApi } from '@/lib/api/customer';
import { formatPrice } from '@/lib/utils/format';
import { ShoppingBag, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { useOrderMetricsStore } from '@/lib/store/orderMetricsStore';

export default function CustomerDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  
  // State to track if the component is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  // Initialize the order metrics store for direct access
  const orderMetricsStore = useOrderMetricsStore();
  
  // Get metrics from local storage with useMemo to prevent unnecessary recalculations
  // Don't include orderMetricsStore in dependencies to avoid infinite loops
  const localMetrics = React.useMemo(() => {
    if (!isMounted) return orderMetricsStore.getCustomerMetrics();
    return orderMetricsStore.getCustomerMetrics();
  }, [isMounted]); // Only recompute when mounted state changes
  
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
        console.log('Recalculating customer dashboard metrics');
        orderMetricsStore.calculateMetrics();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array ensures this runs only once on mount
  
  // Fetch dashboard stats from API as a fallback
  const { 
    data: apiStats, 
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['customer', 'dashboard'],
    queryFn: () => customerApi.getDashboardStats(),
    enabled: isAuthenticated,
  });
  
  // Combine API stats with local metrics, preferring API if available
  const stats = apiStats || localMetrics;

  // Debug metrics to console once when values change
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Customer Dashboard Metrics:', { 
        apiStats,
        localMetrics,
        finalStats: stats,
        ordersInStore: orderMetricsStore.orders?.length || 0
      });
    }
  }, [apiStats, stats, localMetrics.totalOrders]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="mb-6">You need to be logged in to view your dashboard.</p>
          <Button asChild>
            <Link href="/login?userType=customer">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
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
          ) : statsError && !localMetrics.recentOrders.length ? (
            <p className="text-red-500">Error loading recent orders</p>
          ) : (stats?.recentOrders || localMetrics.recentOrders)?.length > 0 ? (
            <div className="space-y-4">
              {(stats?.recentOrders || localMetrics.recentOrders).map((order: any) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">Order #{typeof order.id === 'string' ? order.id.substring(0, 8) : 'N/A'}</p>
                    <p className="text-sm text-gray-500">{order.restaurant?.name || 'Restaurant'}</p>
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
        <CardFooter>
          {/* Orders are fetched from local storage in development mode */}
        </CardFooter>
      </Card>
    </div>
  );
} 