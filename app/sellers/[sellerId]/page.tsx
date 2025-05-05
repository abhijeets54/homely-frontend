'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { foodApi } from '../../../lib/api';
import { MainLayout } from '../../../components/layouts';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { formatPrice } from '../../../lib/utils/format';
import { useCart } from '../../../components/providers/cart-provider';
import { useAuth } from '../../../providers/auth-provider'; // Corrected import
import { toast } from 'sonner';
import { debugCartApi } from '../../../lib/api/debug-cart';

interface SellerDetailPageProps {
  params: {
    sellerId: string; // Ensure sellerId is always a string
  };
}

export default function SellerDetailPage({ params }: SellerDetailPageProps) {
  // Properly extract the sellerId parameter using React.use()
  const { sellerId } = React.use(params);

  // Ensure sellerId is defined
  if (!sellerId) {
      console.error('Error: sellerId is undefined'); // Log the error without additional arguments
      return null; // Prevent rendering if sellerId is not available
  }

  const { isAuthenticated } = useAuth(); // Use useAuth instead of useAuthContext
  const { addToCart, setOpenCartCallback } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Set a direct cart opening function
  useEffect(() => {
    const openCartDirectly = () => {
      // This will be called when an item is added to cart
      // The actual opening happens in the ImprovedCartSheet component
      console.log('Item added to cart, should open cart now');
    };
    
    setOpenCartCallback(openCartDirectly);
    
    // Clean up the callback when the component unmounts
    return () => setOpenCartCallback(() => {});
  }, [setOpenCartCallback]);

  // Fetch seller details
  const { 
    data: seller, 
    isLoading: sellerLoading 
  } = useQuery({
    queryKey: ['seller', sellerId],
    queryFn: () => foodApi.getSellerById(sellerId),
    enabled: !!sellerId, // Ensure the query only runs if sellerId is defined
    staleTime: 1000 * 60 * 5, // Optional: cache the result for 5 minutes
  });

  // Fetch seller's menu categories
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['categories', sellerId],
    queryFn: () => foodApi.getCategoriesBySeller(sellerId), // Corrected function name
  });

  // Fetch seller's menu items
  const { 
    data: menuItems = [], 
    isLoading: menuItemsLoading 
  } = useQuery({
    queryKey: ['menu-items', sellerId],
    queryFn: () => foodApi.getFoodItemsBySeller(sellerId), // Corrected function name
  });

  // Loading state
  const isLoading = sellerLoading || categoriesLoading || menuItemsLoading;

  // Filter menu items by category
  const filteredMenuItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === activeCategory);

  // Handle add to cart

  const handleAddToCart = async (item: any) => {
    // Check if item is available
    if (!item.isAvailable) {
      toast.error('This item is currently unavailable');
      return;
    }

    try {
      console.log('Attempting to add to cart:', item);
      
      // Make sure we're using the correct ID field
      const itemId = item._id || item.id;
      
      if (!itemId) {
        console.error('Item has no ID:', item);
        toast.error('Could not add item to cart: Missing item ID');
        return;
      }
      
      // Convert the item to a proper FoodItem format if needed
      const foodItem = {
        id: itemId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl || '',
        isAvailable: item.isAvailable,
        categoryId: item.categoryId || '',
        restaurantId: item.restaurantId || sellerId,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        stock: item.stock || 10,
        description: item.description || '',
        dietaryInfo: item.dietaryInfo || ''
      };
      
      // Use our improved cart function which works with or without authentication
      await addToCart(foodItem, 1);
      
      toast.success(`${item.name} added to cart`);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error(`Could not add ${item.name} to cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  //   if (!item.isAvailable || item.stock <= 0) {
  //     toast.error('This item is currently unavailable');
  //     return;
  //   }

  //   addToCart({
  //     id: item.id,
  //     name: item.name,
  //     price: item.price,
  //     quantity: 1,
  //     sellerId: sellerId,
  //     sellerName: seller?.name || '',
  //   });

  //   toast.success(`${item.name} added to cart`);
  // };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href="/sellers">
            <span className="mr-2">←</span> Back to Sellers
          </Link>
        </Button>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading seller details...</p>
          </div>
        ) : seller ? (
          <>
            {/* Seller Header */}
            <div className="relative h-64 rounded-xl overflow-hidden mb-6">
              <Image
                src={`https://source.unsplash.com/random/1200x400/?kitchen,cooking,${sellerId}`}
                alt={seller.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{seller.name}</h1>
                    <p className="text-white/90">{seller.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {seller.status === 'open' ? (
                      <Badge variant="outline" className="bg-green-500">Open</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500">Closed</Badge>
                    )}
                    {seller.rating && (
                      <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-yellow-400 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                        <span className="text-white font-medium">{seller.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Categories */}
            <div className="mb-8">
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="mb-4 flex flex-wrap h-auto">
                  <TabsTrigger value="all" className="mb-2">
                    All Items
                  </TabsTrigger>
                  {categories.map((category: any) => (
                    <TabsTrigger key={category._id} value={category._id} className="mb-2">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={activeCategory}>
                  {filteredMenuItems.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No items found in this category</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredMenuItems.map((item: any) => (
                        <Card key={item._id} className={`overflow-hidden ${!item.isAvailable || item.stock <= 0 ? 'opacity-70' : ''}`}>
                          <div className="relative h-48">
                            <Image
                              src={item.imageUrl || `https://source.unsplash.com/random/400x300/?food,${item.name}`}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                            {(!item.isAvailable || item.stock <= 0) && (
                              <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  Out of Stock
                                </span>
                              </div>
                            )}
                            {item.dietaryInfo && (
                              <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                                {item.dietaryInfo.includes('vegetarian') && (
                                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    Vegetarian
                                  </span>
                                )}
                                {item.dietaryInfo.includes('vegan') && (
                                  <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">
                                    Vegan
                                  </span>
                                )}
                                {item.dietaryInfo.includes('gluten-free') && (
                                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                    Gluten-Free
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-lg">{item.name}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                              </div>
                              <p className="font-bold text-lg">{formatPrice(item.price)}</p>
                            </div>
                            <div className="mt-4">
                              <Button 
                                className="w-full" 
                                disabled={!item.isAvailable || item.stock <= 0 || seller.status !== 'open'}
                                onClick={() => handleAddToCart(item)}
                              >
                                Add to Cart
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))} 
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Seller Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find the seller you're looking for.</p>
            <Button asChild>
              <Link href="/sellers">Browse Sellers</Link>
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
