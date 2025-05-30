'use client';

import React, { useState, useEffect, use } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { foodApi, useAddToCart } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { Seller, Category, FoodItem } from '@/lib/types/models';
import { MapPin, Star, Clock, Phone, Plus, Minus, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useFormStatus } from 'react-dom';
import { useParams } from 'next/navigation';

// Function to emit cart event (will be called on the client)
function emitCartEvent(success: boolean, message: string) {
  if (typeof window !== 'undefined') {
    console.log('Emitting cart event:', { success, message });
    const event = new CustomEvent('cartResponse', { 
      detail: { success, message } 
    });
    window.dispatchEvent(event);
  }
}

// Server action for adding to cart
async function addItemToCart(formData: FormData) {
  'use server';
  
  console.log('Server action: Adding item to cart');
  
  let success = false;
  let message = '';
  
  try {
    const foodItemId = formData.get('foodItemId') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const itemName = formData.get('itemName') as string;
    
    if (!foodItemId || isNaN(quantity) || quantity <= 0) {
      console.error('Invalid food item or quantity', { foodItemId, quantity });
      message = 'Invalid quantity selected';
      return { success, message };
    }
    
    console.log('Server action: Making API request with', { foodItemId, quantity });
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${formData.get('token')}`
      },
      body: JSON.stringify({ foodItemId, quantity }),
      cache: 'no-store'
    });
    
    console.log('Server action: API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to add item to cart', errorData);
      message = errorData.message || 'Failed to add item to cart';
      return { success, message };
    }
    
    console.log('Item added to cart successfully');
    success = true;
    message = `${quantity} × ${itemName} added to your cart.`;
  } catch (error) {
    console.error('Error in server action:', error);
    message = 'An error occurred while adding to cart';
  }
  
  // Return the result that will be available to the client
  return { success, message };
}

// Add this helper at the top, after imports
const getCategoryId = (categoryId: any) =>
  typeof categoryId === 'string'
    ? categoryId
    : categoryId?._id || categoryId?.id || '';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { toast } = useToast();
  
  // Add to cart mutation
  const addToCart = useAddToCart();
  
  // Listen for cart response events from server actions
  useEffect(() => {
    const handleCartResponse = (event: CustomEvent<{ success: boolean; message: string }>) => {
      console.log('Cart response event received:', event.detail);
      const { success, message } = event.detail;
      
      if (success) {
        toast({
          title: "Added to Cart",
          description: message,
        });
        
        // Invalidate cart queries to refresh the cart data
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    };
    
    window.addEventListener('cartResponse', handleCartResponse as EventListener);
    return () => {
      window.removeEventListener('cartResponse', handleCartResponse as EventListener);
    };
  }, [toast, queryClient]);

  // Fetch restaurant details
  const { 
    data: restaurant, 
    isLoading: restaurantLoading,
    error: restaurantError
  } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      try {
        const response = await foodApi.getSellerById(id);
        return response;
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
        throw error;
      }
    },
  });

  // Fetch menu categories
  const { 
    data: categories = [], 
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      try {
        const response = await foodApi.getCategoriesBySeller(id);
        return response;
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
    enabled: !!id,
  });

  // Set the first category as selected if none is selected
  React.useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Fetch food items for the selected category
  const { 
    data: foodItems = [], 
    isLoading: foodItemsLoading,
    error: foodItemsError
  } = useQuery({
    queryKey: ['foodItems', id, selectedCategory],
    queryFn: async () => {
      try {
        if (!selectedCategory) return [];
        const response = await foodApi.getFoodItemsByCategory(selectedCategory);
        return response;
      } catch (error) {
        console.error('Error fetching food items:', error);
        return [];
      }
    },
    enabled: !!id && !!selectedCategory,
  });

  // Handle quantity change
  const handleQuantityChange = (itemId: string, change: number) => {
    setQuantities(prev => {
      const currentQuantity = prev[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  // Handle add to cart
  const handleAddToCart = (foodItem: FoodItem) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    if (user?.role !== 'customer') {
      toast({
        title: "Access Denied",
        description: "Only customers can add items to cart.",
        variant: "destructive",
      });
      return;
    }

    const quantity = quantities[foodItem.id] || 0;
    if (quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please select at least one item to add to cart.",
        variant: "destructive",
      });
      return;
    }

    // Show loading state
    toast({
      title: "Adding to Cart",
      description: `Adding ${quantity} × ${foodItem.name} to your cart...`,
    });

    addToCart.mutate(
      { 
        foodItemId: foodItem.id, 
        quantity 
      },
      {
        onSuccess: () => {
          toast({
            title: "Added to Cart",
            description: `${quantity} × ${foodItem.name} added to your cart.`,
          });
          // Reset quantity after adding to cart
          setQuantities(prev => ({ ...prev, [foodItem.id]: 0 }));
        },
        onError: (error: any) => {
          console.error('Add to cart error:', error);
          
          // Extract error message for display
          let errorMessage = 'Unknown error occurred';
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data?.message || 'Server error';
          }
          
          toast({
            title: "Error",
            description: `Failed to add item to cart: ${errorMessage}`,
            variant: "destructive",
          });
        }
      }
    );
  };

  // Add this useEffect to handle cart responses
  React.useEffect(() => {
    // Listen for cart response messages
    const handleCartResponse = (event: CustomEvent) => {
      const { success, message } = event.detail;
      
      toast({
        title: success ? "Added to Cart" : "Error",
        description: message,
        variant: success ? "default" : "destructive",
      });
    };
    
    // Add event listener
    window.addEventListener('cartResponse' as any, handleCartResponse);
    
    // Clean up
    return () => {
      window.removeEventListener('cartResponse' as any, handleCartResponse);
    };
  }, [toast]);

  // Loading state
  const isLoading = restaurantLoading || categoriesLoading || foodItemsLoading;
  
  // Error state
  const hasError = restaurantError || categoriesError || foodItemsError;

  if (hasError) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6 text-center">
            <CardTitle className="text-red-500 mb-2">Error Loading Restaurant</CardTitle>
            <CardDescription>
              We encountered an error while loading the restaurant details. Please try again later.
            </CardDescription>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {restaurantLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ) : restaurant ? (
          <>
            <div className="mb-8">
              <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-4">
                <Image
                  src={restaurant.image || '/placeholder-restaurant.jpg'}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {restaurant.address}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400" />
                  {restaurant.rating?.toFixed(1) || 'New'}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {restaurant.status === 'open' ? 'Open' : 'Closed'}
                </div>
                {restaurant.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {restaurant.phone}
                  </div>
                )}
              </div>
            </div>

            {categoriesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : categories.length > 0 ? (
              <Tabs value={selectedCategory || ''} onValueChange={setSelectedCategory}>
                <TabsList className="mb-4">
                  {categories.map((category: Category) => (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category: Category) => (
                  <TabsContent key={category.id} value={category.id}>
                    {foodItemsLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton key={i} className="h-48 w-full" />
                        ))}
                      </div>
                    ) : foodItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(category.id === 'all'
                          ? foodItems
                          : foodItems.filter((item: FoodItem) => getCategoryId(item.categoryId) === category.id)
                        ).map((item: FoodItem) => (
                          <Card key={item.id} className={`overflow-hidden ${!item.isAvailable ? 'opacity-60' : ''}`}>
                            <div className="flex flex-col md:flex-row">
                              <div className="relative h-40 md:h-auto md:w-1/3">
                                <Image
                                  src={item.imageUrl || '/placeholder-food.jpg'}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                      {item.description || 'No description available'}
                                    </p>
                                    {item.dietaryInfo && (
                                      <Badge variant="outline" className="mb-2">
                                        {item.dietaryInfo}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-bold">₹{item.price.toFixed(2)}</p>
                                </div>
                                {item.isAvailable && (
                                  <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleQuantityChange(item.id, -1)}
                                        disabled={!quantities[item.id]}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="w-8 text-center">{quantities[item.id] || 0}</span>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleQuantityChange(item.id, 1)}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <Button
                                      onClick={() => handleAddToCart(item)}
                                      disabled={!quantities[item.id]}
                                    >
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      Add to Cart
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-6 text-center">
                        <CardTitle className="mb-2">No Items Available</CardTitle>
                        <CardDescription>
                          This category doesn't have any food items yet.
                        </CardDescription>
                      </Card>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <Card className="p-6 text-center">
                <CardTitle className="mb-2">No Menu Available</CardTitle>
                <CardDescription>
                  This restaurant hasn't added any menu categories yet. Please check back later.
                </CardDescription>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-6 text-center">
            <CardTitle className="mb-2">Restaurant Not Found</CardTitle>
            <CardDescription>
              The restaurant you're looking for doesn't exist or has been removed.
            </CardDescription>
            <Button className="mt-4" asChild>
              <Link href="/restaurants">Back to Restaurants</Link>
            </Button>
          </Card>
        )}
      </div>
    </MainLayout>
  );
} 