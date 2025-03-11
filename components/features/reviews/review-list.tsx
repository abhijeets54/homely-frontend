'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Review } from '@/lib/types';

interface ReviewListProps {
  sellerId: string;
}

export function ReviewList({ sellerId }: ReviewListProps) {
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ['reviews', sellerId],
    queryFn: async () => {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      return [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!reviews?.length) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 text-center">
        <Icons.message className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No reviews yet</h3>
        <p className="text-sm text-muted-foreground">
          Be the first to review this seller!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{review.customerName}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(review.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icons.star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icons.verified className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                Verified Order
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm">{review.comment}</p>
        </Card>
      ))}
    </div>
  );
} 