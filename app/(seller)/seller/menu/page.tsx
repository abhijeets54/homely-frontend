'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerApi } from '@/lib/api';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils/format';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { UtensilsCrossed } from 'lucide-react';
import type { Category, FoodItem } from '@/lib/types';

const getCategoryId = (categoryId: any) =>
  typeof categoryId === 'string'
    ? categoryId
    : categoryId?._id || categoryId?.id || '';

export default function SellerMenuPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('items');

  console.log('isAuthenticated:', isAuthenticated);
  console.log('user:', user);
  console.log('user._id:', user?._id);

  const { data: categoriesData = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['seller-categories', user?._id] as const,
    queryFn: async () => {
      if (!user?._id) {
        console.warn('QueryFn: user._id is missing! Skipping API call.');
        return []; // Return early — do NOT call the API
      }
  
      return await sellerApi.getCategories(user._id);
    },
    enabled: isAuthenticated && !!user && !!user._id,
  });

  const {
    data: foodItemsData = [],
    isLoading: foodItemsLoading,
    error: foodItemsError,
  } = useQuery({
    queryKey: ['seller-food-items', user?._id] as const,
    queryFn: () => sellerApi.getFoodItems(user!._id),
    enabled: isAuthenticated && !!user && !!user._id,
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ itemId, isAvailable }: { itemId: string; isAvailable: boolean }) =>
      sellerApi.updateMenuItemAvailability(itemId, isAvailable),
    onMutate: async ({ itemId, isAvailable }) => {
      await queryClient.cancelQueries({ 
        queryKey: ['seller-food-items', user?._id] as const 
      });
      const previousItems = queryClient.getQueryData<FoodItem[]>(['seller-food-items', user?._id] as const);
      queryClient.setQueryData<FoodItem[]>(['seller-food-items', user?._id] as const, (old) =>
        old?.map((item) => (item.id === itemId ? { ...item, isAvailable } : item))
      );
      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['seller-food-items', user?._id] as const, context.previousItems);
      }
      toast.error('Failed to update item availability');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['seller-food-items', user?._id] as const 
      });
    },
    onSuccess: () => {
      toast.success('Item availability updated');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => sellerApi.deleteMenuItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['seller-food-items', user?._id] as const 
      });
      toast.success('Item deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete item');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => sellerApi.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['seller-categories', user?._id] as const 
      });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      if (error?.response?.status === 400) {
        toast.error('Cannot delete category with food items. Please move or delete the items first.');
      } else {
        toast.error('Failed to delete category');
      }
      console.error('Error deleting category:', error);
    },
  });

  const handleToggleAvailability = (itemId: string, current: boolean) => {
    toggleAvailabilityMutation.mutate({ itemId, isAvailable: !current });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this item?')) deleteItemMutation.mutate(id);
  };

  const handleDeleteCategory = (id: string) => {
    const hasItems = foodItemsData.some((item) => getCategoryId(item.categoryId) === id);
    if (hasItems) {
      toast.error('Cannot delete category with food items. Please move or delete the items first.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const filteredItems = foodItemsData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || getCategoryId(item.categoryId) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">Please log in to manage your menu.</p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (categoriesError || foodItemsError) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Data</CardTitle>
              <CardDescription>There was a problem loading your menu data. Please try again later.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">
                {(categoriesError as Error)?.message || (foodItemsError as Error)?.message}
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => location.reload()}>Retry</Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-muted-foreground">Manage your items and categories</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/seller/menu/items/new">Add Item</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/seller/menu/categories/new">Add Category</Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select
                    className="border rounded-md px-3 py-2"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All</option>
                    {categoriesData.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(foodItemsLoading ? Array.from({ length: 6 }) : filteredItems).map((item: any, i) => (
                    <Card key={item?.id || i} className={item?.isAvailable === false ? 'opacity-50' : ''}>
                      {foodItemsLoading ? (
                        <CardContent>
                          <Skeleton className="h-40 w-full mb-4" />
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      ) : (
                        <CardContent>
                          <Image
                            src={item.imageUrl || `https://source.unsplash.com/random/400x300/?food,${item.name}`}
                            alt={item.name}
                            width={400}
                            height={300}
                            className="rounded-lg mb-2"
                          />
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <p className="font-bold">{formatPrice(item.price)}</p>
                            <Switch
                              checked={item.isAvailable}
                              onCheckedChange={() => handleToggleAvailability(item.id, item.isAvailable)}
                            />
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/seller/menu/items/${item.id}`}>Edit</Link>
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {categoriesData.length === 0 ? (
                  <p className="text-center text-muted-foreground">No categories found.</p>
                ) : (
                  <div className="space-y-4">
                    {categoriesData.map((cat) => {
                      const hasItems = foodItemsData.some((item) => getCategoryId(item.categoryId) === cat.id);
                      return (
                        <div key={cat.id} className="flex justify-between items-center border p-4 rounded-md">
                          <div>
                            <h3 className="font-semibold text-lg">{cat.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {foodItemsData.filter((item) => getCategoryId(item.categoryId) === cat.id).length} items
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/seller/menu/categories/${cat.id}`}>Edit</Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCategory(cat.id)}
                              disabled={hasItems}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
