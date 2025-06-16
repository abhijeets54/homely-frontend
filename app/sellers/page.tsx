'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { foodApi } from '@/lib/api';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Seller } from '@/lib/types/models';
import { useAuth } from '@/providers/auth-provider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getSellerImageUrl } from '@/lib/utils/image';
import CloudinaryImage from '@/components/CloudinaryImage';

export default function SellersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [initialAuthCheck, setInitialAuthCheck] = useState<boolean>(false);

  // Wait for auth to be initialized before rendering
  useEffect(() => {
    if (!authLoading) {
      setInitialAuthCheck(true);
    }
  }, [authLoading]);

  // Fetch all sellers
  const { 
    data: sellers = [], 
    isLoading: sellersLoading,
    error
  } = useQuery<Seller[]>({
    queryKey: ['sellers'],
    queryFn: () => foodApi.getSellers(),
    // Only fetch when auth state is determined
    enabled: initialAuthCheck,
  });

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Home Chefs</h1>
          <p className="text-gray-600">Find delicious home-cooked meals from talented chefs in your area</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <Input
                placeholder="Search for home chefs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex flex-wrap gap-2">
                {/* City filter buttons will go here */}
              </div>
            </div>
          </div>
        </div>

        {/* Sellers Grid */}
        {sellersLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Error loading sellers</h2>
            <p className="text-red-600 mb-6">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller: Seller) => (
              <Link href={`/sellers/${seller._id}`} key={seller._id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="relative h-40">
                    <CloudinaryImage
                      src={getSellerImageUrl(seller.imageUrl || seller.image)}
                      alt={seller.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg">{seller.name}</h3>
                    <p className="text-gray-500 text-sm">{seller.address}</p>
                    {seller.status && (
                      <div className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${
                        seller.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {seller.status === 'open' ? 'Open' : 'Closed'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
