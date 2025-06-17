'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { foodApi } from '@/lib/api';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Seller } from '@/lib/types/models';
import { useAuth } from '@/providers/auth-provider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getSellerImageUrl } from '@/lib/utils/image';
import CloudinaryImage from '@/components/CloudinaryImage';
import { motion, Variants } from 'framer-motion';
import { AnimatedSection, AnimatedStaggerContainer, AnimatedChild } from '@/components/ui/animated-section';

export default function SellersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [initialAuthCheck, setInitialAuthCheck] = useState<boolean>(false);

  // Wait for auth to be initialized before rendering
  useEffect(() => {
    if (!authLoading) {
      setInitialAuthCheck(true);
    }
  }, [authLoading]);

  // Fetch all sellers
  const { 
    data: sellers = [], 
    isLoading: sellersLoading,
    error
  } = useQuery<Seller[]>({
    queryKey: ['sellers'],
    queryFn: () => foodApi.getSellers(),
    // Only fetch when auth state is determined
    enabled: initialAuthCheck,
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <AnimatedSection direction="down" className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Home Chefs</h1>
          <p className="text-gray-600">Find delicious home-cooked meals from talented chefs in your area</p>
        </AnimatedSection>

        {/* Search and Filters */}
        <AnimatedSection direction="up" delay={0.2} className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <Input
                placeholder="Search for home chefs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex flex-wrap gap-2">
                {/* City filter buttons will go here */}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Sellers Grid */}
        {sellersLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <AnimatedSection className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Error loading sellers</h2>
            <p className="text-red-600 mb-6">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </AnimatedSection>
        ) : (
          <AnimatedStaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller: Seller) => (
              <AnimatedChild key={seller._id}>
                <Link href={`/sellers/${seller._id}`}>
                  <motion.div
                    whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="overflow-hidden h-full">
                      <div className="relative h-40">
                        <CloudinaryImage
                          src={getSellerImageUrl(seller.imageUrl || seller.image)}
                          alt={seller.name}
                          fill
                          className="object-cover"
                        />
                        {/* Animated overlay on hover */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0"
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg">{seller.name}</h3>
                        <p className="text-gray-500 text-sm">{seller.address}</p>
                        {seller.status && (
                          <div className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${
                            seller.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {seller.status === 'open' ? 'Open' : 'Closed'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </AnimatedChild>
            ))}
          </AnimatedStaggerContainer>
        )}
      </div>
    </MainLayout>
  );
}
