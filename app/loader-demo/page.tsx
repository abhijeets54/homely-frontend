'use client';

import React from 'react';
import { MainLayout } from '@/components/layouts';
import LoadingDemo from '@/components/ui/loading-demo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLoadingState } from '@/lib/hooks/use-loading';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import LoadingLink from '@/components/ui/loading-link';

export default function LoaderDemoPage() {
  const router = useRouter();
  const { showLoadingFor, variant, setVariant } = useLoadingState();
  
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Food Loader Demonstration</h1>
        
        <div className="grid gap-8">
          <LoadingDemo />
          
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Navigation Loading Demo</h2>
            <p className="mb-6">
              The loader automatically shows during page navigation. Click the buttons below to navigate to different pages and see the loading animation.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Select Loader Variant</h3>
              <RadioGroup 
                defaultValue={variant} 
                onValueChange={(value) => setVariant(value as any)}
                className="grid grid-cols-2 sm:grid-cols-5 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="plate" id="plate" />
                  <Label htmlFor="plate">Plate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cooking" id="cooking" />
                  <Label htmlFor="cooking">Cooking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery">Delivery</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pizza" id="pizza" />
                  <Label htmlFor="pizza">Pizza</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="burger" id="burger" />
                  <Label htmlFor="burger">Burger</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <LoadingLink href="/">Go to Home</LoadingLink>
              </Button>
              <Button asChild>
                <LoadingLink href="/restaurants">Go to Restaurants</LoadingLink>
              </Button>
              <Button asChild>
                <LoadingLink href="/about">Go to About</LoadingLink>
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
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
                Show {variant} loader (2s)
              </Button>
              
              <Button 
                onClick={() => {
                  showLoadingFor(4000);
                }}
              >
                Show {variant} loader (4s)
              </Button>
              
              <Button 
                onClick={() => {
                  // Show each variant in sequence
                  const variants = ['plate', 'cooking', 'delivery', 'pizza', 'burger'];
                  let index = 0;
                  
                  const showNext = () => {
                    if (index < variants.length) {
                      showLoadingFor(1500, variants[index] as any);
                      setTimeout(() => {
                        index++;
                        showNext();
                      }, 2000);
                    }
                  };
                  
                  showNext();
                }}
              >
                Show all variants in sequence
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 