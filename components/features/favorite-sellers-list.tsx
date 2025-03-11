'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Seller } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icons } from '@/components/ui/icons';

interface FavoriteSellersListProps {
  sellers: Seller[];
  isLoading?: boolean;
}

export function FavoriteSellersList({
  sellers,
  isLoading,
}: FavoriteSellersListProps) {
  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (sellers.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-4 text-center">
        <Icons.heart className="h-12 w-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">No favorite sellers yet</p>
          <p className="text-sm text-muted-foreground">
            Add sellers to your favorites to see them here.
          </p>
        </div>
        <Button asChild>
          <Link href="/sellers">Browse Sellers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sellers.map((seller) => (
        <Card
          key={seller.id}
          className="group overflow-hidden transition-all hover:shadow-lg"
        >
          <div className="relative aspect-[4/3]">
            <Image
              src={`https://source.unsplash.com/400x300/?restaurant,food&random=${seller.id}`}
              alt={seller.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-semibold text-white">{seller.name}</h3>
              <p className="text-sm text-white/90">{seller.address}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  seller.status === 'open' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium capitalize">
                {seller.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {seller.rating && (
                <div className="flex items-center gap-1">
                  <Icons.star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{seller.rating}</span>
                </div>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/sellers/${seller.id}`}>View Menu</Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 