'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoadingState } from '@/lib/hooks/use-loading';

/**
 * This component intercepts all navigation events and shows the loader
 * It should be used inside the app layout
 */
export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startLoading, stopLoading } = useLoadingState();

  // Listen for route changes
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // Define event handlers
    const handleRouteChangeStart = () => {
      startLoading();
    };

    const handleRouteChangeComplete = () => {
      // Delay hiding the loader to ensure it's visible for a minimum time
      timeout = setTimeout(() => {
        stopLoading();
      }, 500); // Minimum loading time of 500ms
    };

    // Intercept browser back/forward buttons
    window.addEventListener('popstate', handleRouteChangeStart);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChangeStart);
      if (timeout) clearTimeout(timeout);
    };
  }, [startLoading, stopLoading]);

  // Show loader on regular navigation (pathname or search params change)
  useEffect(() => {
    startLoading();
    
    // Hide loader after a minimum time
    const timeout = setTimeout(() => {
      stopLoading();
    }, 800);
    
    return () => clearTimeout(timeout);
  }, [pathname, searchParams, startLoading, stopLoading]);

  return null;
}

export default NavigationEvents; 