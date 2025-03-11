'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerApi, useCategories, useFoodItems } from '@/lib/api';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  UtensilsCrossed,
  DollarSign,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/ui/icons';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Category, FoodItem } from '@/lib/types';

export default function SellerMenuPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fallback to direct API calls if the hooks are not available
  let categoriesData;
  let categoriesLoading = false;
  let categoriesError = null;
  let foodItemsData;
  let foodItemsLoading = false;
  let foodItemsError = null;
  
  try {
    // Try to use the hooks if they're available
    const { data: categories, isLoading: catLoading, error: catError } = useQuery({
      queryKey: ['seller-categories'],
      queryFn: () => sellerApi.getCategories(),
      enabled: isAuthenticated && !!user?.id,
    });
    
    const { data: foodItems, isLoading: foodLoading, error: foodError } = useQuery({
      queryKey: ['seller-food-items'],
      queryFn: () => sellerApi.getFoodItems(),
      enabled: isAuthenticated && !!user?.id,
    });
    
    categoriesData = categories;
    categoriesLoading = catLoading;
    categoriesError = catError;
    foodItemsData = foodItems;
    foodItemsLoading = foodLoading;
    foodItemsError = foodError;
  } catch (error) {
    console.error('Error with category/food queries:', error);
    categoriesError = error;
    foodItemsError = error;
  }
  
  // Fetch menu items
  const { 
    data: menuItems = [], 
    isLoading: menuItemsLoading 
  } = useQuery({
    queryKey: ['seller-menu-items'],
    queryFn: () => sellerApi.getMenuItems(),
    enabled: isAuthenticated,
  });

  const { toast } = useToast();

  // Toggle item availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ itemId, isAvailable }: { itemId: string, isAvailable: boolean }) => 
      sellerApi.updateMenuItem(itemId, { isAvailable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-menu-items'] });
      toast.success('Item availability updated');
    },
    onError: () => {
      toast.error('Failed to update item availability');
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => sellerApi.deleteMenuItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-menu-items'] });
      toast.success('Item deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete item');
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => sellerApi.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete category');
    },
  });

  // Handle toggle availability
  const handleToggleAvailability = (itemId: string, currentValue: boolean) => {
    toggleAvailabilityMutation.mutate({ itemId, isAvailable: !currentValue });
  };

  // Handle delete item
  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(itemId);
    }
  };

  // Handle delete category
  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? All associated items will be affected.')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  // Filter menu items based on search query and selected category
  const filteredMenuItems = menuItems.filter((item: any) => {
    const matchesSearch = 
      searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      item.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Loading state
  const isLoading = authLoading || menuItemsLoading || categoriesLoading;

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingFoodItem, setIsAddingFoodItem] = useState(false);

  const filteredFoodItems = selectedCategory
    ? foodItemsData?.filter((item) => item.categoryId === selectedCategory)
    : foodItemsData;

  // Add category mutation
  const { mutate: addCategory } = useMutation({
    mutationFn: async (name: string) => {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast({
        title: 'Success',
        description: 'Category added successfully',
      });
    },
  });

  // Add food item mutation
  const { mutate: addFoodItem } = useMutation({
    mutationFn: async (data: Partial<FoodItem>) => {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['food-items']);
      toast({
        title: 'Success',
        description: 'Food item added successfully',
      });
    },
  });

  // Update food item mutation
  const { mutate: updateFoodItem } = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<FoodItem>;
    }) => {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['food-items']);
      toast({
        title: 'Success',
        description: 'Food item updated successfully',
      });
    },
  });

  // Delete food item mutation
  const { mutate: deleteFoodItem } = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['food-items']);
      toast({
        title: 'Success',
        description: 'Food item deleted successfully',
      });
    },
  });

  // Display error message if there are issues with the backend
  if (categoriesError || foodItemsError) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
              <p className="text-gray-600">Manage your food items and categories</p>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Backend Implementation Issue</CardTitle>
              <CardDescription>
                There is an issue with the menu management API in the backend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
                <h3 className="font-medium text-amber-800 mb-2">Required Backend Endpoints:</h3>
                <p className="text-sm text-amber-700 mb-4">
                  The following endpoints need to be properly implemented in the backend:
                </p>
                <ul className="list-disc pl-5 text-sm text-amber-700">
                  <li><code>GET /api/category/seller</code> - Get all categories for the authenticated seller</li>
                  <li><code>GET /api/food/seller</code> - Get all food items for the authenticated seller</li>
                  <li><code>GET /api/food/category/:categoryId</code> - Get food items by category</li>
                </ul>
              </div>
              
              <p className="text-red-500 mb-4">Error details: {(categoriesError as Error)?.message || (foodItemsError as Error)?.message}</p>
              <p className="text-sm text-gray-500">
                Please check miss.md for implementation details.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">Please log in to manage your menu.</p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
            <p className="text-gray-600">Manage your food items and categories</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <Button asChild>
              <Link href="/seller/menu/items/new">Add New Item</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/seller/menu/categories/new">Add New Category</Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading menu data...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="items">Food Items</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            
            {/* Food Items Tab */}
            <TabsContent value="items">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Food Items</CardTitle>
                  <CardDescription>Manage your menu items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="w-full md:w-1/2">
                      <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-1/2">
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        {categoriesData?.map((category: any) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {filteredFoodItems?.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No items found.</p>
                      {foodItemsData?.length > 0 ? (
                        <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                          Clear Filters
                        </Button>
                      ) : (
                        <Button asChild>
                          <Link href="/seller/menu/items/new">Add Your First Item</Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {foodItemsLoading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i}>
                              <CardContent className="p-0">
                                <Skeleton className="h-48 rounded-t-lg" />
                                <div className="p-4">
                                  <Skeleton className="h-6 w-2/3 mb-2" />
                                  <Skeleton className="h-4 w-1/2 mb-4" />
                                  <Skeleton className="h-4 w-1/3" />
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        : filteredFoodItems?.map((item: any) => {
                            const category = categoriesData?.find((c: any) => c.id === item.categoryId);
                            return (
                              <Card key={item.id} className={`overflow-hidden ${!item.isAvailable ? 'opacity-70' : ''}`}>
                                <div className="relative h-48">
                                  <Image
                                    src={item.imageUrl || `https://source.unsplash.com/random/400x300/?food,${item.name}`}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                  {!item.isAvailable && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                      <div className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center">
                                        <UtensilsCrossed className="mr-2 h-4 w-4" />
                                        Out of Stock
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h3 className="font-bold text-lg">{item.name}</h3>
                                      <p className="text-gray-500 text-sm">{category?.name || 'Uncategorized'}</p>
                                      <p className="text-gray-500 text-sm line-clamp-2 mt-1">{item.description}</p>
                                    </div>
                                    <p className="font-bold text-lg">{formatPrice(item.price)}</p>
                                  </div>
                                  <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id={`available-${item.id}`}
                                        checked={item.isAvailable}
                                        onCheckedChange={() => handleToggleAvailability(item.id, item.isAvailable)}
                                      />
                                      <Label htmlFor={`available-${item.id}`}>
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                      </Label>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button variant="outline" size="sm" asChild>
                                        <Link href={`/seller/menu/items/${item.id}`}>Edit</Link>
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => handleDeleteItem(item.id)}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Categories Tab */}
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Manage your menu categories</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoriesData?.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No categories found.</p>
                      <Button asChild>
                        <Link href="/seller/menu/categories/new">Add Your First Category</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categoriesData?.map((category: any) => {
                        const itemsInCategory = foodItemsData?.filter((item: any) => item.categoryId === category.id).length;
                        return (
                          <div key={category.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold text-lg">{category.name}</h3>
                                <p className="text-gray-500 text-sm">{itemsInCategory} items</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/seller/menu/categories/${category.id}`}>Edit</Link>
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteCategory(category.id)}
                                  disabled={itemsInCategory > 0}
                                >
                                  Delete
                                </Button>
                              </div>
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
        )}
      </div>
    </MainLayout>
  );
} 