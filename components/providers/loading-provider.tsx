'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import FoodLoader from '../ui/food-loader';

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
  const initialRenderComplete = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathnameRef = useRef(pathname);
  const prevSearchParamsRef = useRef(searchParams.toString());
  
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
  
  // Mark initial render complete after hydration
  useEffect(() => {
    initialRenderComplete.current = true;
  }, []);

  // Handle navigation changes
  useEffect(() => {
    // Skip the initial render
    if (!initialRenderComplete.current) return;
    
    // Check if this is a navigation event
    const currentPathname = pathname;
    const currentSearchParams = searchParams.toString();
    
    if (
      currentPathname !== prevPathnameRef.current || 
      currentSearchParams !== prevSearchParamsRef.current
    ) {
      // Navigation detected - show loader
      setIsLoading(true);
      
      // Update refs for next comparison
      prevPathnameRef.current = currentPathname;
      prevSearchParamsRef.current = currentSearchParams;
      
      // Hide loader after navigation completes
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Handle popstate events (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      if (initialRenderComplete.current) {
        setIsLoading(true);
        
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, variant, setVariant }}>
      {/* Loading overlay - only show after initial render is complete */}
      {isLoading && initialRenderComplete.current && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <FoodLoader variant={variant} size="lg" />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export default LoadingProvider; 