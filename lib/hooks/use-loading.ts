'use client';

import { useLoading } from '@/components/providers/loading-provider';

type LoaderVariant = 'plate' | 'cooking' | 'delivery' | 'pizza' | 'burger';

/**
 * Custom hook to access and control the global loading state
 * 
 * @returns Object with loading state and control functions
 */
export const useLoadingState = () => {
  const { isLoading, setIsLoading, variant, setVariant } = useLoading();

  /**
   * Start the loading animation
   * @param customVariant - Optional variant to use
   */
  const startLoading = (customVariant?: LoaderVariant) => {
    if (customVariant) {
      setVariant(customVariant);
    }
    setIsLoading(true);
  };

  /**
   * Stop the loading animation
   */
  const stopLoading = () => setIsLoading(false);

  /**
   * Show loading animation for a specific duration
   * @param duration - Duration in milliseconds
   * @param customVariant - Optional variant to use
   */
  const showLoadingFor = (duration: number = 800, customVariant?: LoaderVariant) => {
    if (customVariant) {
      setVariant(customVariant);
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, duration);
  };

  /**
   * Wrap an async function with loading state
   * @param asyncFn - The async function to wrap
   * @param customVariant - Optional variant to use
   * @returns The wrapped function
   */
  const withLoading = <T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>,
    customVariant?: LoaderVariant
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        if (customVariant) {
          setVariant(customVariant);
        }
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
    variant,
    setVariant,
    startLoading,
    stopLoading,
    showLoadingFor,
    withLoading
  };
};

export default useLoadingState; 