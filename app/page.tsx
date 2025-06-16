'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { foodApi } from '../lib/api';
import { MainLayout } from '../components/layouts';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Seller } from '../lib/types/models';
import { getSellerImageUrl } from '@/lib/utils/image';
import CloudinaryImage from '@/components/CloudinaryImage';

export default function HomePage() {
  // Fetch featured sellers
  const { data: sellers = [], isLoading, isError } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => foodApi.getSellers(),
    // Add retry and stale time options to improve error handling
    retry: 1,
    staleTime: 60000, // 1 minute
  });

  // Take only the first 4 sellers for the featured section
  const featuredSellers = sellers.slice(0, 4);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-secondary to-secondary-light py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Delicious Home-Cooked Meals Delivered to Your Door
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Support local home chefs and enjoy authentic, freshly prepared food from the comfort of your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/sellers">Order Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register?userType=seller">Become a Seller</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Delicious home-cooked food"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Sellers</h3>
              <p className="text-gray-600">
                Explore a variety of home chefs in your area and their unique menus.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Place Your Order</h3>
              <p className="text-gray-600">
                Select your favorite dishes and place your order with just a few clicks.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Your Meal</h3>
              <p className="text-gray-600">
                Receive your freshly prepared meal delivered right to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sellers Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Featured Sellers</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading sellers...</p>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-40">
              <p>Unable to load sellers. Please try again later.</p>
            </div>
          ) : featuredSellers.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>No sellers available at the moment. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredSellers.map((seller: Seller, index) => (
                  <Card key={seller.id || index} className="hover:shadow-lg transition-shadow duration-300">
                    {/* Seller Image */}
                    <div className="relative h-40 w-full rounded-t-lg overflow-hidden">
                      <CloudinaryImage
                        src={getSellerImageUrl(seller.imageUrl || seller.image)}
                        alt={seller.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{seller.name}</CardTitle>
                      <CardDescription>{seller.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full mr-2 ${seller.status === 'open' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm">{seller.status === 'open' ? 'Open' : 'Closed'}</span>
                      </div>
                      {seller.rating && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm">{seller.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/sellers/${seller._id}`}>View Menu</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/sellers">View All Sellers</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-secondary/30">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The food from Homely reminds me of my mother's cooking! The authentic flavors bring back childhood memories. The paneer butter masala was absolutely delicious."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full mr-3 overflow-hidden relative">
                    <Image 
                      src="https://randomuser.me/api/portraits/men/36.jpg" 
                      alt="Rajesh Sharma"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Rajesh Sharma</p>
                    <p className="text-sm text-gray-500">Delhi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/30">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "As a working professional, Homely has been a lifesaver! The South Indian meals are perfectly spiced, and I love supporting local home chefs. Their dosa and sambhar are outstanding."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full mr-3 overflow-hidden relative">
                    <Image 
                      src="https://randomuser.me/api/portraits/women/33.jpg" 
                      alt="Priya Patel"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Priya Patel</p>
                    <p className="text-sm text-gray-500">Mumbai</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/30">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "My family loves the variety of regional cuisines available on Homely. The Bengali fish curry was exceptional, and the biryani is consistently the best I've had in Bangalore!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full mr-3 overflow-hidden relative">
                    <Image 
                      src="https://randomuser.me/api/portraits/men/22.jpg" 
                      alt="Vikram Iyer"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Vikram Iyer</p>
                    <p className="text-sm text-gray-500">Bangalore</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Homely?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers enjoying delicious home-cooked meals delivered to their doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-primary" asChild>
              <Link href="/register">Sign Up Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link href="/sellers">Browse Sellers</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

