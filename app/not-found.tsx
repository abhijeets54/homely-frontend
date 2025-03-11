'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layouts';

export default function NotFoundPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative w-64 h-64 mx-auto">
            <Image
              src="/images/404-plate.svg"
              alt="Empty plate - Page not found"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900">Oops! Page Not Found</h1>
          
          <p className="text-lg text-gray-600 mt-4">
            We couldn't find the page you're looking for. It seems this dish isn't on our menu.
          </p>
          
          <div className="mt-8 space-y-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/">
                Return Home
              </Link>
            </Button>
            
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/sellers">
                  Browse Sellers
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 