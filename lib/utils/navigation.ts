'use client';

import { useRouter } from 'next/navigation';
import { useLoadingState } from '@/lib/hooks/use-loading';

/**
 * Custom hook for programmatic navigation with loading state
 */
export const useNavigation = () => {
  const router = useRouter();
  
  /**
   * Navigate to a new page
   * @param href - The URL to navigate to
   */
  const navigate = (href: string) => {
    // Just use the router directly
    // The loading provider will detect the navigation and show the loader
    router.push(href);
  };
  
  /**
   * Replace the current URL with a new one
   * @param href - The URL to navigate to
   */
  const replace = (href: string) => {
    // Just use the router directly
    // The loading provider will detect the navigation and show the loader
    router.replace(href);
  };
  
  return {
    navigate,
    replace
  };
}; 