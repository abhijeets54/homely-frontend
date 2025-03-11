'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useSellers } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  Heart,
  Search,
  MapPin,
  Star,
  Store,
  ChefHat,
  Clock,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CustomerFavoritesPage() {
  const { user } = useAuth();
  const { data: sellers, isLoading } = useSellers();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Filter favorite sellers
  const favoriteSellers = sellers?.filter((seller) =>
    user?.favoriteSellers?.includes(seller.id)
  );

  // Filter by search query
  const filteredSellers = favoriteSellers?.filter(
    (seller) =>
      seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFavorite = (sellerId: string) => {
    // Implement remove from favorites when backend is ready
    toast({
      title: 'Seller removed from favorites',
      description: 'The seller has been removed from your favorites.',
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="mb-8">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Favorite Sellers</h1>
        <p className="text-muted-foreground">
          Quick access to your favorite home chefs
        </p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search your favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredSellers?.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No favorite sellers yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start exploring and add your favorite home chefs to this list
              </p>
              <Button asChild>
                <Link href="/customer/dashboard">Explore Sellers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSellers?.map((seller) => (
            <Card key={seller.id} className="group relative">
              <div className="absolute right-4 top-4 z-10">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={() => handleRemoveFavorite(seller.id)}
                >
                  <Heart className="h-5 w-5 fill-primary text-primary" />
                </Button>
              </div>
              <Link href={`/seller/${seller.id}`}>
                <div className="relative h-48">
                  <Image
                    src={`/images/sellers/${seller.id}.jpg`}
                    alt={seller.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-semibold text-lg">{seller.name}</h3>
                    <p className="text-sm flex items-center opacity-90">
                      <MapPin className="h-4 w-4 mr-1" />
                      {seller.address}
                    </p>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm">
                        {seller.rating?.toFixed(1) || 'New'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm">30-45 min</span>
                    </div>
                    <div className="flex items-center">
                      <Store
                        className={`h-4 w-4 mr-1 ${
                          seller.status === 'open'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      />
                      <span className="text-sm capitalize">{seller.status}</span>
                    </div>
                    <div className="flex items-center">
                      <ChefHat className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm">Home Chef</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" asChild>
                    <Link href={`/seller/${seller.id}`}>View Menu</Link>
                  </Button>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 