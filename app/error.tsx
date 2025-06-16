'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layouts';
import { AlertCircle } from 'lucide-react';
import { ErrorBoundaryProvider } from '@/components/providers/error-boundary-provider';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  // Log the error to an error reporting service
  React.useEffect(() => {
    console.error('Application error:', error);
    // Here you would typically log to a service like Sentry
  }, [error]);

  return (
    <ErrorBoundaryProvider>
      <MainLayout>
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900">Something Went Wrong</h1>
            
            <p className="text-lg text-gray-600 mt-4">
              We're sorry, but we encountered an unexpected error while processing your request.
            </p>
            
            {error.digest && (
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm text-gray-600">Error ID: {error.digest}</p>
              </div>
            )}
            
            <div className="mt-8 space-y-4">
              <Button 
                onClick={reset}
                size="lg" 
                className="w-full"
              >
                Try Again
              </Button>
              
              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/">
                    Return Home
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link href="/contact">
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-8">
              If this problem persists, please contact our support team with the error ID above.
            </p>
          </div>
        </div>
      </MainLayout>
    </ErrorBoundaryProvider>
  );
} 