'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils/format';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/components/providers/cart-provider';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@/lib/types/auth';

export default function CheckoutSuccessPage() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const queryClient = useQueryClient();
  
  const orderId = searchParams.get('orderId') || 'Unknown';
  const total = searchParams.get('total') ? parseFloat(searchParams.get('total')!) : 0;
  
  // Get the dashboard URL from localStorage or default to user role
  const getDashboardUrl = () => {
    if (typeof window !== 'undefined') {
      const storedUrl = localStorage.getItem('dashboard_redirect');
      if (storedUrl) {
        return storedUrl;
      }
    }
    
    // Fallback based on user role
    if (user) {
      if (user.role === 'seller') return '/seller/dashboard';
      if (user.role === 'customer') return '/customer/dashboard';
    }
    return '/customer/dashboard';
  };
  
  const dashboardUrl = getDashboardUrl();
  
  // Revalidate cart data when the page loads
  useEffect(() => {
    // Force revalidation of cart data
    if (isAuthenticated && user && user.role === ('customer' as UserRole)) {
      // Invalidate React Query cache for cart
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  }, [isAuthenticated, user, queryClient]);
  
  // Auto-redirect to dashboard after countdown
  useEffect(() => {
    if (countdown <= 0) {
      // Clear stored URL after using it
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dashboard_redirect');
      }
      router.push(dashboardUrl);
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, router, dashboardUrl]);
  
  return (
    <MainLayout>
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Order Confirmed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Your order has been successfully placed. We've sent a confirmation to your email.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Order ID:</span>
                  <span>{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Redirecting to dashboard in {countdown} seconds...
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button asChild className="w-full">
                <Link href={dashboardUrl}>View Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 