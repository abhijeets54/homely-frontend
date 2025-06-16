'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';

export default function DeliveryDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  if (!isAuthenticated && !authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">Please log in to view your delivery dashboard.</p>
            <Button asChild>
              <Link href="/login?userType=delivery">Login</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Delivery Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}</p>
          </div>
        </div>

        {/* Coming Soon Message */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Delivery Features Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              The delivery partner features are currently under development and will be available in a future update.
            </p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 