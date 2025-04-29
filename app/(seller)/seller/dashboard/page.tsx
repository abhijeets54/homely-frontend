'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import { sellerApi } from '@/lib/api/seller'; // Updated to seller API
import { formatPrice } from '@/lib/utils/format';
import { ShoppingBag, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SellerDashboardPage() {
  const { user, role, isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();

  // 🔒 Wait for auth to load
  if (isInitializing) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-lg">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  // 🔐 Block unauthorized access
  if (!isAuthenticated || role !== 'seller') {
    router.push('/login?userType=seller');
    return null;
  }

  // ✅ Fetch dashboard stats once authenticated
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: () => sellerApi.getDashboardStats(),
    enabled: isAuthenticated && role === 'seller',
  });


  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to view your dashboard.</p>
            <Button asChild>
              <span>

              <Link href="/login?userType=seller">Login</Link> {/* Updated link */}
              </span>
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
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild>
              <span>
                
              <Link href="/sellers">Browse Sellers</Link> {/* Updated link */}
              </span>
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
              <CardTitle>Error Loading Dashboard</CardTitle>
              <CardDescription>
                We encountered an error while loading your dashboard statistics.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => window.location.reload()}>Retry</Button>
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
                    <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                    <h3 className="text-2xl font-bold mt-1">{stats?.pendingOrders || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed Orders</p>
                    <h3 className="text-2xl font-bold mt-1">{stats?.completedOrders || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Spent</p>
                    <h3 className="text-2xl font-bold mt-1">₹{formatPrice(stats?.totalSpent || 0)}</h3>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        <p className="text-sm text-gray-500">{order.restaurant?.name || 'Restaurant'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{formatPrice(order.totalPrice)}</p>
                        <p className="text-sm text-gray-500 capitalize">{order.status}</p>
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
                <span>

                <Link href="/seller/orders">View All Orders</Link> {/* Updated link */}
                </span>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Favorite Restaurants</CardTitle>
              <CardDescription>Your favorite places to order from</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : statsError ? (
                <p className="text-red-500">Error loading favorite restaurants</p>
              ) : stats?.favoriteSellers?.length > 0 ? (
                <div className="space-y-4">
                  {stats.favoriteSellers.map((seller: any) => (
                    <div key={seller.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <p className="text-sm text-gray-500">{seller.address}</p>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/restaurants/${seller.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No favorite restaurants yet</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <span>

                <Link href="/restaurants">Explore Restaurants</Link> {/* Updated link */}
                </span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
