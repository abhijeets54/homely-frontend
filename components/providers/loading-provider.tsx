'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import FoodLoader from '../ui/food-loader';
import NavigationEvents from './navigation-events';

type LoaderVariant = 'plate' | 'cooking' | 'delivery' | 'pizza' | 'burger';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  variant: LoaderVariant;
  setVariant: React.Dispatch<React.SetStateAction<LoaderVariant>>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [variant, setVariant] = useState<LoaderVariant>('cooking');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [prevSearchParams, setPrevSearchParams] = useState(searchParams);
  
  // Track navigation changes
  useEffect(() => {
    // Check if path or search params changed
    const pathChanged = prevPathname !== pathname;
    const searchChanged = prevSearchParams.toString() !== searchParams.toString();
    
    if (pathChanged || searchChanged) {
      // Navigation detected - show loader
      setIsLoading(true);
      
      // Store current values for next comparison
      setPrevPathname(pathname);
      setPrevSearchParams(searchParams);
      
      // Hide loader after a delay to ensure it's visible during navigation
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Longer delay to ensure visibility
      
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, prevPathname, prevSearchParams]);
  
  // Get a random loader variant
  const getRandomVariant = (): LoaderVariant => {
    const variants: LoaderVariant[] = ['plate', 'cooking', 'delivery', 'pizza', 'burger'];
    return variants[Math.floor(Math.random() * variants.length)];
  };
  
  // Change the variant when loading starts
  useEffect(() => {
    if (isLoading) {
      setVariant(getRandomVariant());
    }
  }, [isLoading]);
  
  // Initial page load
  useEffect(() => {
    // Show loader briefly on initial load
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, variant, setVariant }}>
      {/* Navigation events listener */}
      <NavigationEvents />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <FoodLoader variant={variant} size="lg" />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export default LoadingProvider; 