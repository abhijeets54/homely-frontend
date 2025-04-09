'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { sellerApi } from '@/lib/api';
import { categorySchema, CategoryFormValues } from '@/lib/validation/food';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/auth-provider';

interface EditCategoryPageProps {
  params: {
    categoryId: string;
  };
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { categoryId } = params;
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Fetch category
  const { 
    data: category, 
    isLoading: categoryLoading,
    error: categoryError
  } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => sellerApi.getCategoryById(categoryId),
    enabled: isAuthenticated && !!categoryId,
  });

  // Fetch menu items in this category
  const { 
    data: menuItems = [], 
    isLoading: menuItemsLoading 
  } = useQuery({
    queryKey: ['menu-items-by-category', categoryId],
    queryFn: () => sellerApi.getFoodItemsByCategory(categoryId),
    enabled: isAuthenticated && !!categoryId,
  });

  // Form setup
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  });

  // Update form values when category data is loaded
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
      });
    }
  }, [category, form]);

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormValues) => sellerApi.updateCategory(categoryId, data),
    onSuccess: () => {
      toast.success('Category updated successfully');
      router.push('/seller/menu?tab=categories');
    },
    onError: (error) => {
      toast.error('Failed to update category');
      console.error(error);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: () => sellerApi.deleteCategory(categoryId),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      router.push('/seller/menu?tab=categories');
    },
    onError: (error) => {
      toast.error('Failed to delete category');
      console.error(error);
    },
  });

  // Handle form submission
  const handleSubmit = (values: CategoryFormValues) => {
    updateCategoryMutation.mutate(values);
  };

  // Handle delete
  const handleDelete = () => {
    if (menuItems.length > 0) {
      toast.error('Cannot delete category with menu items. Please move or delete the items first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate();
    }
  };

  // Loading state
  const isLoading = authLoading || categoryLoading || menuItemsLoading;

  if (!isAuthenticated && !authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">Please log in as a seller to edit categories.</p>
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
            <Link href="/seller/menu?tab=categories">
              <span className="mr-2">←</span> Back to Categories
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Category</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        ) : categoryError ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Category</h2>
            <p className="text-gray-600 mb-6">We couldn't find the category you're looking for.</p>
            <Button asChild>
              <Link href="/seller/menu?tab=categories">Return to Categories</Link>
            </Button>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Edit Category</CardTitle>
                <CardDescription>
                  Update your category details
                </CardDescription>
              </CardHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter category name"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  {menuItems.length > 0 && (
                    <div className="bg-amber-50 p-4 rounded-md">
                      <p className="text-amber-800 text-sm">
                        This category contains {menuItems.length} menu item{menuItems.length !== 1 ? 's' : ''}. 
                        You cannot delete it until all items are moved or deleted.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="destructive" 
                    type="button" 
                    onClick={handleDelete}
                    disabled={deleteCategoryMutation.isPending || menuItems.length > 0}
                  >
                    {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete Category'}
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" type="button" asChild>
                      <Link href="/seller/menu?tab=categories">Cancel</Link>
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateCategoryMutation.isPending || !form.formState.isDirty}
                    >
                      {updateCategoryMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 