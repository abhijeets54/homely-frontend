'use client';

import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';

export default function DeliveryDashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Delivery Feature Coming Soon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The delivery partner features are currently under development and will be available in a future update.
              </p>
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
} 