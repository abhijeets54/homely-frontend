'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { sellerApi } from '@/lib/api';
import { foodItemSchema, FoodItemFormValues } from '@/lib/validation/food';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/providers/auth-provider';

export default function NewFoodItemPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const sellerId = user?._id;
  
  console.log('Seller ID:', sellerId);
  // Fetch categories
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['seller-categories', sellerId],
    queryFn: () => sellerId ? sellerApi.getCategories(sellerId) : Promise.resolve([]),
    enabled: isAuthenticated && !!user?._id,
  });

  // Form setup
  const form = useForm<FoodItemFormValues>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      imageUrl: '',
      isAvailable: true,
      stock: 1,
      dietaryInfo: [],
    },
  });

  type CreateFoodItemInput = FoodItemFormValues & {
    restaurantId: string;
  };

  // Create food item mutation
  const createFoodItemMutation = useMutation({
    mutationFn: (data: CreateFoodItemInput) => {
      const transformedData = {
        ...data,
        dietaryInfo: data.dietaryInfo.join(','), // Convert array to comma-separated string
      };
      return sellerApi.createFoodItem(transformedData);
    },
    onSuccess: () => {
      toast.success('Food item created successfully');
      router.push('/seller/menu');
    },
    onError: (error) => {
      toast.error('Failed to create food item');
      console.error(error);
    },
  });

  // Handle form submission
  const handleSubmit = (values: FoodItemFormValues) => {
    if (!sellerId) {
      toast.error('Seller ID is missing. Please log in again.');
      return;
    }
  
    createFoodItemMutation.mutate({
      ...values,
      restaurantId: sellerId,
    });
  };

  // Loading state
  const isLoading = authLoading || categoriesLoading;

  // Dietary options
  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'dairy-free', label: 'Dairy-Free' },
    { id: 'nut-free', label: 'Nut-Free' },
    { id: 'spicy', label: 'Spicy' },
  ];

  if (!isAuthenticated && !authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">Please log in as a seller to create food items.</p>
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
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/seller/menu">
              <span className="mr-2">←</span> Back to Menu
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Add New Food Item</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Food Item Details</CardTitle>
                <CardDescription>
                  Add a new food item to your menu
                </CardDescription>
              </CardHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CardContent className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter food item name"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your food item"
                      {...form.register('description')}
                      rows={3}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...form.register('price', { valueAsNumber: true })}
                    />
                    {form.formState.errors.price && (
                      <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select
                      onValueChange={(value) => form.setValue('categoryId', value)}
                      defaultValue={form.getValues('categoryId')}
                    >
                      <SelectTrigger id="categoryId">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.categoryId && (
                      <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>
                    )}
                  </div>

                  {/* Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      placeholder="Enter image URL"
                      {...form.register('imageUrl')}
                    />
                    {form.formState.errors.imageUrl && (
                      <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...form.register('stock', { valueAsNumber: true })}
                    />
                    {form.formState.errors.stock && (
                      <p className="text-sm text-red-500">{form.formState.errors.stock.message}</p>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isAvailable"
                      checked={form.watch('isAvailable')}
                      onCheckedChange={(checked) => form.setValue('isAvailable', checked)}
                    />
                    <Label htmlFor="isAvailable">Available for Order</Label>
                  </div>

                  {/* Dietary Info */}
                  <div className="space-y-2">
                    <Label>Dietary Information</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {dietaryOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dietary-${option.id}`}
                            checked={form.watch('dietaryInfo')?.includes(option.id)}
                            onCheckedChange={(checked) => {
                              const currentValues = form.watch('dietaryInfo') || [];
                              const newValues = checked
                                ? [...currentValues, option.id]
                                : currentValues.filter((value) => value !== option.id);
                              form.setValue('dietaryInfo', newValues);
                            }}
                          />
                          <Label htmlFor={`dietary-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/seller/menu">Cancel</Link>
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createFoodItemMutation.isPending || !form.formState.isDirty}
                  >
                    {createFoodItemMutation.isPending ? 'Creating...' : 'Create Food Item'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 