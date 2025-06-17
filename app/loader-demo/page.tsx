'use client';

import React from 'react';
import { MainLayout } from '@/components/layouts';
import LoadingDemo from '@/components/ui/loading-demo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLoadingState } from '@/lib/hooks/use-loading';

export default function LoaderDemoPage() {
  const router = useRouter();
  const { showLoadingFor } = useLoadingState();
  
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Food Loader Demonstration</h1>
        
        <div className="grid gap-8">
          <LoadingDemo />
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Navigation Loading Demo</h2>
            <p className="mb-6">
              The loader automatically shows during page navigation. Click the buttons below to navigate to different pages and see the loading animation.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => router.push('/')}>
                Go to Home
              </Button>
              <Button onClick={() => router.push('/restaurants')}>
                Go to Restaurants
              </Button>
              <Button onClick={() => router.push('/about')}>
                Go to About
              </Button>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Manual Loading Demo</h2>
            <p className="mb-6">
              You can also manually trigger the loading state for specific operations.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => {
                  showLoadingFor(2000);
                }}
              >
                Show Loading for 2 seconds
              </Button>
              
              <Button 
                onClick={() => {
                  showLoadingFor(4000);
                }}
              >
                Show Loading for 4 seconds
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 