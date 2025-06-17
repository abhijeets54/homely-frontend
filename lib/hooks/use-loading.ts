'use client';

import { useLoading } from '@/components/providers/loading-provider';

/**
 * Custom hook to access and control the global loading state
 * 
 * @returns Object with loading state and control functions
 */
export const useLoadingState = () => {
  const { isLoading, setIsLoading } = useLoading();

  /**
   * Start the loading animation
   */
  const startLoading = () => setIsLoading(true);

  /**
   * Stop the loading animation
   */
  const stopLoading = () => setIsLoading(false);

  /**
   * Show loading animation for a specific duration
   * @param duration - Duration in milliseconds
   */
  const showLoadingFor = (duration: number = 800) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, duration);
  };

  /**
   * Wrap an async function with loading state
   * @param asyncFn - The async function to wrap
   * @returns The wrapped function
   */
  const withLoading = <T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        setIsLoading(true);
        const result = await asyncFn(...args);
        return result;
      } finally {
        setIsLoading(false);
      }
    };
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    showLoadingFor,
    withLoading
  };
};

export default useLoadingState; 