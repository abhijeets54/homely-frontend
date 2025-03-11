'use client';

import React from 'react';
import { MainLayout } from '@/components/layouts';
import { NotificationsList } from '@/components/features/notifications';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to view your notifications.</p>
            <Button asChild>
              <Link href="/login?userType=customer">Login</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Notifications</h1>
          <NotificationsList showHeader={false} />
        </div>
      </div>
    </MainLayout>
  );
} 