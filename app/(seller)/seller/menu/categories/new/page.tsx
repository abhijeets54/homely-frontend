'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
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

export default function NewCategoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Form setup
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormValues) => sellerApi.createCategory(data),
    onSuccess: () => {
      toast.success('Category created successfully');
      router.push('/seller/menu?tab=categories');
    },
    onError: (error) => {
      toast.error('Failed to create category');
      console.error(error);
    },
  });

  // Handle form submission
  const handleSubmit = (values: CategoryFormValues) => {
    createCategoryMutation.mutate(values);
  };

  if (!isAuthenticated && !authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">Please log in as a seller to create categories.</p>
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
          <h1 className="text-3xl font-bold">Add New Category</h1>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Add a new category to organize your menu items
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
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" asChild>
                  <Link href="/seller/menu?tab=categories">Cancel</Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCategoryMutation.isPending || !form.formState.isDirty}
                >
                  {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 