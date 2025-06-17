'use client';

import { useRouter } from 'next/navigation';
import { useLoadingState } from '@/lib/hooks/use-loading';

/**
 * Custom hook for programmatic navigation with loading state
 */
export const useNavigation = () => {
  const router = useRouter();
  const { startLoading } = useLoadingState();
  
  /**
   * Navigate to a new page with loading state
   * @param href - The URL to navigate to
   * @param options - Navigation options
   */
  const navigate = (href: string, options?: { delay?: number }) => {
    // Start the loading animation
    startLoading();
    
    // Navigate after a small delay to ensure the loader is visible
    setTimeout(() => {
      router.push(href);
    }, options?.delay || 300);
  };
  
  /**
   * Replace the current URL with a new one with loading state
   * @param href - The URL to navigate to
   * @param options - Navigation options
   */
  const replace = (href: string, options?: { delay?: number }) => {
    // Start the loading animation
    startLoading();
    
    // Navigate after a small delay to ensure the loader is visible
    setTimeout(() => {
      router.replace(href);
    }, options?.delay || 300);
  };
  
  return {
    navigate,
    replace
  };
}; 