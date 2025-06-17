'use client';

import React, { useState } from 'react';
import { Button } from './button';
import FoodLoader from './food-loader';
import { useLoadingState } from '@/lib/hooks/use-loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

export function LoadingDemo() {
  const [variant, setVariant] = useState<'plate' | 'cooking' | 'delivery' | 'pizza' | 'burger'>('cooking');
  const { showLoadingFor } = useLoadingState();
  
  return (
    <div className="flex flex-col items-center space-y-8 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold">Food Loader Variants</h2>
      
      <Tabs defaultValue="cooking" onValueChange={(value) => setVariant(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="plate">Plate</TabsTrigger>
          <TabsTrigger value="cooking">Cooking</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="pizza">Pizza</TabsTrigger>
          <TabsTrigger value="burger">Burger</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plate" className="flex justify-center py-8">
          <FoodLoader variant="plate" size="lg" />
        </TabsContent>
        
        <TabsContent value="cooking" className="flex justify-center py-8">
          <FoodLoader variant="cooking" size="lg" />
        </TabsContent>
        
        <TabsContent value="delivery" className="flex justify-center py-8">
          <FoodLoader variant="delivery" size="lg" />
        </TabsContent>
        
        <TabsContent value="pizza" className="flex justify-center py-8">
          <FoodLoader variant="pizza" size="lg" />
        </TabsContent>
        
        <TabsContent value="burger" className="flex justify-center py-8">
          <FoodLoader variant="burger" size="lg" />
        </TabsContent>
      </Tabs>
      
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-lg font-medium">Show Global Loader</h3>
        <div className="flex space-x-4">
          <Button onClick={() => showLoadingFor(2000)} variant="default">
            Show {variant} loader (2s)
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <FoodLoader variant="plate" size="sm" />
          <p className="mt-4 text-sm text-center">Small Size</p>
        </div>
        
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <FoodLoader variant="plate" size="md" />
          <p className="mt-4 text-sm text-center">Medium Size</p>
        </div>
        
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <FoodLoader variant="plate" size="lg" />
          <p className="mt-4 text-sm text-center">Large Size</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingDemo; 