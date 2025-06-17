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
import { useAuth } from '../../../providers/auth-provider';
import { toast } from 'sonner';
import { debugCartApi } from '../../../lib/api/debug-cart';
import { FoodItem } from '../../../lib/types/models';
import { getSellerImageUrl, getFullImageUrl } from '@/lib/utils/image';
import CloudinaryImage from '@/components/CloudinaryImage';
import AnimateOnScroll from '@/components/ui/animate-on-scroll';
import HoverCardEffect from '@/components/ui/hover-card-effect';
import FoodPatternBackground from '@/components/ui/food-pattern-background';

interface SellerDetailPageProps {
  params: {
    sellerId: string; // Ensure sellerId is always a string
  };
}

// Add this helper at the top, after imports
const getCategoryId = (categoryId: any) =>
  typeof categoryId === 'string'
    ? categoryId
    : categoryId?._id || categoryId?.id || '';

export default function SellerDetailPage({ params }: SellerDetailPageProps) {
  // Extract the sellerId parameter directly from params
  const { sellerId } = params;
  
  // State for parallax effect
  const [scrollY, setScrollY] = useState(0);
  
  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure sellerId is defined and log it for debugging
  console.log('Current sellerId:', sellerId);
  
  // Early return with a user-friendly message if sellerId is missing
  if (!sellerId || sellerId === 'undefined') {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Invalid Seller ID</h2>
          <p className="text-gray-600 mb-6">The seller ID is missing or invalid.</p>
          <Button asChild>
            <Link href="/sellers">Browse Sellers</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const { isAuthenticated } = useAuth();
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
    isLoading: sellerLoading,
    error: sellerError
  } = useQuery({
    queryKey: ['seller', sellerId],
    queryFn: () => foodApi.getSellerById(sellerId),
    enabled: !!sellerId && sellerId !== 'undefined', // Only run if sellerId is valid
    staleTime: 1000 * 60 * 5, // Optional: cache the result for 5 minutes
  });

  // Log any seller fetch errors
  useEffect(() => {
    if (sellerError) {
      console.error('Error fetching seller:', sellerError);
    }
  }, [sellerError]);

  // Fetch seller's menu categories
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['categories', sellerId],
    queryFn: () => foodApi.getCategoriesBySeller(sellerId),
    enabled: !!sellerId && sellerId !== 'undefined', // Only run if sellerId is valid
  });

  // Fetch seller's menu items
  const { 
    data: menuItems = [], 
    isLoading: menuItemsLoading 
  } = useQuery({
    queryKey: ['menu-items', sellerId],
    queryFn: () => foodApi.getFoodItemsBySeller(sellerId),
    enabled: !!sellerId && sellerId !== 'undefined', // Only run if sellerId is valid
  });

  // Loading state
  const isLoading = sellerLoading || categoriesLoading || menuItemsLoading;

  // Update filteredMenuItems logic
  const filteredMenuItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => getCategoryId(item.categoryId) === activeCategory);

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
      
      // Convert the item to a format compatible with the cart
      const foodItem = {
        id: itemId,
        name: item.name,
        price: item.price,
        image: item.imageUrl || '',
        isAvailable: item.isAvailable !== false,
        category: item.categoryId || '',
        restaurantId: item.restaurantId || sellerId,
        description: item.description || '',
        preparationTime: item.preparationTime || 30,
        ingredients: item.ingredients || []
      };
      
      // Use our improved cart function which works with or without authentication
      await addToCart(foodItem as any, 1);
      
      toast.success(`${item.name} added to cart`);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error(`Could not add ${item.name} to cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <MainLayout transitionType="fade">
      <div className="container mx-auto px-4 py-8">
        <AnimateOnScroll animation="fade-in-up">
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="mb-6 hover:bg-primary/10 transition-all duration-300"
          >
            <Link href="/sellers">
              <span className="mr-2">←</span> Back to Sellers
            </Link>
          </Button>
        </AnimateOnScroll>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : seller ? (
          <>
            {/* Seller Header with Parallax Effect */}
            <AnimateOnScroll animation="fade-in-up">
              <div className="relative h-72 rounded-2xl overflow-hidden mb-8 shadow-xl">
                <div 
                  className="absolute inset-0 z-0"
                  style={{ transform: `translateY(${scrollY * 0.1}px)` }}
                >
                  <CloudinaryImage
                    src={getSellerImageUrl(seller.imageUrl || seller.image)}
                    alt={seller.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary rounded-full opacity-20 blur-xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-spice rounded-full opacity-20 blur-xl"></div>
                </div>
                
                <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-2">{seller.name}</h1>
                      <p className="text-white/90 text-lg">{seller.address}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {seller.status === 'open' ? (
                        <Badge variant="outline" className="bg-green-500 text-white px-3 py-1">Open</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-500 text-white px-3 py-1">Closed</Badge>
                      )}
                      {seller.rating && (
                        <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-yellow-400 mr-1.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                          </svg>
                          <span className="text-white font-medium">{seller.rating.toFixed(1)}</span>
                          <span className="ml-1 text-white/80 text-sm">({Math.floor(Math.random() * 100) + 20} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Menu Categories */}
            <FoodPatternBackground variant="light" className="rounded-xl p-6 mb-8">
              <AnimateOnScroll animation="fade-in-up">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-spice bg-clip-text text-transparent">Menu Categories</h2>
                  <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                    <TabsList className="mb-6 flex flex-wrap h-auto bg-white/50 p-1 rounded-lg shadow-soft">
                      <TabsTrigger 
                        value="all" 
                        className="mb-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
                      >
                        All Items
                      </TabsTrigger>
                      {categories.map((category: any) => (
                        <TabsTrigger 
                          key={category._id} 
                          value={category._id} 
                          className="mb-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
                        >
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
                          {filteredMenuItems.map((item: any, index: number) => (
                            <AnimateOnScroll 
                              key={item._id} 
                              animation="fade-in-up" 
                              delay={index % 3 * 100}
                            >
                              <HoverCardEffect disabled={!item.isAvailable || item.stock <= 0}>
                                <Card className={`overflow-hidden border-0 shadow-soft ${!item.isAvailable || item.stock <= 0 ? 'opacity-70' : ''}`}>
                                  <div className="relative h-52">
                                    <CloudinaryImage
                                      src={getFullImageUrl(item.imageUrl)}
                                      alt={item.name}
                                      fill
                                      className="object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                    {(!item.isAvailable || item.stock <= 0) && (
                                      <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                                        <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                                          Out of Stock
                                        </span>
                                      </div>
                                    )}
                                    {item.dietaryInfo && (
                                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                                        {item.dietaryInfo.includes('vegetarian') && (
                                          <span className="bg-herb text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                                            Vegetarian
                                          </span>
                                        )}
                                        {item.dietaryInfo.includes('vegan') && (
                                          <span className="bg-herb-dark text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                                            Vegan
                                          </span>
                                        )}
                                        {item.dietaryInfo.includes('gluten-free') && (
                                          <span className="bg-curry text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                                            Gluten-Free
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <h3 className="font-bold text-xl">{item.name}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 mt-1">{item.description}</p>
                                      </div>
                                      <p className="font-bold text-lg text-primary">{formatPrice(item.price)}</p>
                                    </div>
                                    <div className="mt-4">
                                      <Button 
                                        className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary transition-all duration-300" 
                                        disabled={!item.isAvailable || item.stock <= 0 || seller.status !== 'open'}
                                        onClick={() => handleAddToCart(item)}
                                      >
                                        Add to Cart
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </HoverCardEffect>
                            </AnimateOnScroll>
                          ))} 
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </AnimateOnScroll>
            </FoodPatternBackground>
          </>
        ) : (
          <AnimateOnScroll animation="fade-in-up">
            <div className="text-center py-12 bg-white rounded-xl shadow-soft p-8">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-red-600 mb-3">Seller Not Found</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">We couldn't find the seller you're looking for. They might have moved or the link might be incorrect.</p>
              <Button 
                asChild
                className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary transition-all duration-300"
              >
                <Link href="/sellers">Browse Sellers</Link>
              </Button>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </MainLayout>
  );
}
