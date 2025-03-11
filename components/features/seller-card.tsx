'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Seller } from '@/lib/types';
import { useAuth } from '@/lib/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SellerCardProps {
  seller: Seller;
  showFavoriteButton?: boolean;
}

export function SellerCard({ seller, showFavoriteButton = true }: SellerCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isFavorite = user?.favoriteSellers?.includes(seller.id);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      // TODO: Implement API call
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sellers'] });
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      // TODO: Show login prompt
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  return (
    <Card className="group overflow-hidden">
      <Link href={`/sellers/${seller.id}`} className="block">
        <div className="relative aspect-[4/3]">
          <Image
            src={`https://source.unsplash.com/400x300/?restaurant,food&random=${seller.id}`}
            alt={seller.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {showFavoriteButton && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 text-white hover:text-primary"
              onClick={handleToggleFavorite}
            >
              {isFavorite ? (
                <Icons.heart className="h-5 w-5 fill-primary text-primary" />
              ) : (
                <Icons.heart className="h-5 w-5" />
              )}
              <span className="sr-only">
                {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </span>
            </Button>
          )}
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
            <Button variant="ghost" size="sm" className="font-medium">
              View Menu
              <Icons.arrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
} 