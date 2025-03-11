'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { foodApi } from '@/lib/api';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Seller } from '@/lib/types/models';
import { useAuth } from '@/providers/auth-provider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
  } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => foodApi.getSellers(),
    // Only fetch when auth state is determined
    enabled: initialAuthCheck
  });

  // Filter sellers based on search query and city filter
  const filteredSellers = sellers.filter((seller: Seller) => {
    const matchesSearch = 
      searchQuery === '' || 
      seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = 
      cityFilter === '' || 
      (seller.address && seller.address.toLowerCase().includes(cityFilter.toLowerCase()));
    
    return matchesSearch && matchesCity;
  });

  // Get unique cities for filter
  const cities = [...new Set(sellers.map((seller: Seller) => 
    seller.address ? seller.address.split(',')[0].trim() : ''
  ))].filter(Boolean);

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle city filter change
  const handleCityFilterChange = (city: string) => {
    setCityFilter(city === cityFilter ? '' : city);
  };

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
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Button
                    key={city}
                    variant={cityFilter === city ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCityFilterChange(city)}
                  >
                    {city}
                  </Button>
                ))}
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
        ) : filteredSellers.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No sellers found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <Button onClick={() => { setSearchQuery(''); setCityFilter(''); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller: Seller) => (
              <Card key={seller._id || seller.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt={seller.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  {seller.status === 'open' ? (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Open
                    </span>
                  ) : (
                    <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                      Closed
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{seller.name}</h3>
                      <p className="text-gray-500 text-sm">{seller.address}</p>
                    </div>
                    {seller.rating && (
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-yellow-500 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                        <span className="font-medium text-sm">{seller.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" asChild>
                      <Link href={`/sellers/${seller._id || seller.id}`}>View Menu</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 