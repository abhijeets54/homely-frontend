'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icons } from '@/components/ui/icons';
import { SellerCard } from '@/components/features/seller-card';
import { Seller } from '@/lib/types';

const cuisineTypes = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Italian',
  'Mexican',
  'Thai',
  'Continental',
];

const dietaryPreferences = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Keto',
  'Low-Carb',
];

interface SearchFilters {
  query: string;
  cuisineType: string[];
  priceRange: [number, number];
  rating: number;
  dietaryPreferences: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    cuisineType: [],
    priceRange: [0, 1000],
    rating: 0,
    dietaryPreferences: [],
  });

  const { data: sellers = [], isLoading } = useQuery<Seller[]>({
    queryKey: ['sellers', filters],
    queryFn: async () => {
      // TODO: Implement API call with filters
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return [];
    },
  });

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: SearchFilters[keyof SearchFilters]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Filters Sidebar */}
        <Card className="h-fit p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            
            {/* Search Input */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search for home chefs..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                />
                <Button size="icon">
                  <Icons.search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Cuisine Type */}
            <div className="space-y-2">
              <Label>Cuisine Type</Label>
              <div className="space-y-2">
                {cuisineTypes.map((cuisine) => (
                  <div key={cuisine} className="flex items-center space-x-2">
                    <Checkbox
                      id={cuisine}
                      checked={filters.cuisineType.includes(cuisine)}
                      onCheckedChange={(checked) =>
                        handleFilterChange(
                          'cuisineType',
                          checked
                            ? [...filters.cuisineType, cuisine]
                            : filters.cuisineType.filter((c) => c !== cuisine)
                        )
                      }
                    />
                    <label
                      htmlFor={cuisine}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {cuisine}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range</Label>
              <div className="pt-2">
                <Slider
                  min={0}
                  max={1000}
                  step={50}
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange('priceRange', value)}
                />
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>₹{filters.priceRange[0]}</span>
                  <span>₹{filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={filters.rating === rating ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('rating', rating)}
                  >
                    {rating} <Icons.star className="ml-1 h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="space-y-2">
              <Label>Dietary Preferences</Label>
              <div className="space-y-2">
                {dietaryPreferences.map((preference) => (
                  <div key={preference} className="flex items-center space-x-2">
                    <Checkbox
                      id={preference}
                      checked={filters.dietaryPreferences.includes(preference)}
                      onCheckedChange={(checked) =>
                        handleFilterChange(
                          'dietaryPreferences',
                          checked
                            ? [...filters.dietaryPreferences, preference]
                            : filters.dietaryPreferences.filter(
                                (p) => p !== preference
                              )
                        )
                      }
                    />
                    <label
                      htmlFor={preference}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {preference}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Filters */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setFilters({
                  query: '',
                  cuisineType: [],
                  priceRange: [0, 1000],
                  rating: 0,
                  dietaryPreferences: [],
                })
              }
            >
              Reset Filters
            </Button>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {isLoading
                ? 'Searching...'
                : `${sellers.length} Results Found`}
            </h1>
            <div className="flex items-center space-x-2">
              <Label>Sort by:</Label>
              <select className="rounded-md border p-2">
                <option value="rating">Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : sellers.length === 0 ? (
            <Card className="p-8 text-center">
              <Icons.search className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">No results found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sellers.map((seller) => (
                <SellerCard
                  key={seller.id}
                  seller={seller}
                  showFavoriteButton
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 