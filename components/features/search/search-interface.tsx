'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/icons';

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  rating: number;
  openOnly: boolean;
  sortBy: 'rating' | 'price' | 'distance';
  dietary: string[];
}

const categories = [
  'All',
  'Indian',
  'Chinese',
  'Italian',
  'Mexican',
  'Thai',
  'Japanese',
  'American',
];

const dietaryOptions = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Kosher',
  'Dairy-Free',
];

export function SearchInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || 'All',
    priceRange: [0, 100],
    rating: parseInt(searchParams.get('rating') || '0'),
    openOnly: searchParams.get('openOnly') === 'true',
    sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'rating',
    dietary: searchParams.get('dietary')?.split(',') || [],
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.category !== 'All') params.set('category', filters.category);
    if (filters.rating > 0) params.set('rating', filters.rating.toString());
    if (filters.openOnly) params.set('openOnly', 'true');
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.dietary.length > 0) params.set('dietary', filters.dietary.join(','));

    router.push(`/search?${params.toString()}`);
    setShowMobileFilters(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={filters.category}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Price Range</Label>
        <Slider
          value={filters.priceRange}
          min={0}
          max={100}
          step={1}
          onValueChange={(value: [number, number]) =>
            setFilters((prev) => ({ ...prev, priceRange: value }))
          }
        />
        <div className="flex justify-between text-sm">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Minimum Rating</Label>
        <Select
          value={filters.rating.toString()}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, rating: parseInt(value) }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select minimum rating" />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <SelectItem key={rating} value={rating.toString()}>
                {rating === 0 ? 'Any' : `${rating}+ Stars`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Dietary Preferences</Label>
        <div className="space-y-2">
          {dietaryOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Switch
                id={option}
                checked={filters.dietary.includes(option)}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    dietary: checked
                      ? [...prev.dietary, option]
                      : prev.dietary.filter((d) => d !== option),
                  }))
                }
              />
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value: SearchFilters['sortBy']) =>
            setFilters((prev) => ({ ...prev, sortBy: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="open-only"
          checked={filters.openOnly}
          onCheckedChange={(checked) =>
            setFilters((prev) => ({ ...prev, openOnly: checked }))
          }
        />
        <Label htmlFor="open-only">Open Now</Label>
      </div>
    </div>
  );

  return (
    <div className="sticky top-16 z-30 border-b bg-background px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search for home-cooked meals..."
            value={filters.query}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, query: e.target.value }))
            }
            className="max-w-xl"
          />
          <Button onClick={handleSearch}>
            <Icons.search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Desktop Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="hidden lg:flex">
              <Icons.filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterContent />
              <Button className="mt-6 w-full" onClick={handleSearch}>
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile Filters */}
        <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Icons.filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterContent />
              <Button className="mt-6 w-full" onClick={handleSearch}>
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
} 