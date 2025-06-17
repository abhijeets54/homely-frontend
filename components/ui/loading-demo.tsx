'use client';

import React, { useState } from 'react';
import { Button } from './button';
import FoodLoader from './food-loader';
import { useLoadingState } from '@/lib/hooks/use-loading';

export function LoadingDemo() {
  const [variant, setVariant] = useState<'plate' | 'cooking' | 'delivery'>('plate');
  const { showLoadingFor } = useLoadingState();
  
  return (
    <div className="flex flex-col items-center space-y-8 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold">Food Loader Variants</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <FoodLoader variant="plate" size="md" />
          <p className="mt-4 text-sm text-center">Plate Loader</p>
        </div>
        
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <FoodLoader variant="cooking" size="md" />
          <p className="mt-4 text-sm text-center">Cooking Loader</p>
        </div>
        
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <FoodLoader variant="delivery" size="md" />
          <p className="mt-4 text-sm text-center">Delivery Loader</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-lg font-medium">Show Global Loader</h3>
        <div className="flex space-x-4">
          <Button onClick={() => showLoadingFor(2000)} variant="default">
            Show Loader (2s)
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LoadingDemo; 