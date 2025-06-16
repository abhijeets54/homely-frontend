'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { sellerApi } from '@/lib/api';
import { Seller } from '@/lib/types/models';
import { Search, MapPin, Star, Clock } from 'lucide-react';
import { getSellerImageUrl } from '@/lib/utils/image';
import CloudinaryImage from '@/components/CloudinaryImage';

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch all restaurants
  const { data: restaurants = [], isLoading, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      try {
        const response = await sellerApi.getAllSellers();
        return response;
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        return [];
      }
    },
  });

  // Filter restaurants based on search query
  const filteredRestaurants = restaurants.filter((restaurant: Seller) => 
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Restaurants</h1>
            <p className="text-gray-600">Discover delicious home-cooked meals near you</p>
          </div>
          <div className="mt-4 md:mt-0 relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <CardTitle className="text-red-500 mb-2">Error Loading Restaurants</CardTitle>
            <CardDescription>
              We encountered an error while loading restaurants. Please try again later.
            </CardDescription>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Card>
        ) : filteredRestaurants.length === 0 && !isLoading ? (
          <Card className="p-6 text-center">
            <CardTitle className="mb-2">No Restaurants Found</CardTitle>
            <CardDescription>
              {searchQuery ? (
                <>No restaurants match your search criteria. Try a different search term.</>
              ) : (
                <>
                  It seems the backend API is not returning any restaurants. Please contact the backend developer to implement the following endpoint:
                  <code className="block mt-2 p-2 bg-gray-100 rounded">/api/seller/all</code>
                </>
              )}
            </CardDescription>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant: Seller) => (
              <Link href={`/restaurants/${restaurant.id}`} key={restaurant.id}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-200">
                  <div className="relative h-48 w-full">
                    <CloudinaryImage
                      src={getSellerImageUrl(restaurant.imageUrl || restaurant.image)}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${
                        restaurant.status === 'open' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {restaurant.status === 'open' ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle>{restaurant.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {restaurant.address || 'Location not available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{restaurant.rating ? `${restaurant.rating.toFixed(1)} / 5.0` : 'No ratings yet'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Delivery: 30-45 min</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View Menu</Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 