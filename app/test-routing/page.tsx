'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TestRoutingPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Test Routing Page</h1>

      {/* Link Component Navigation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Using Next.js Link Component</h2>
        <div className="flex gap-4">
          <Link href="/login">
            <Button>Go to Login (Link)</Button>
          </Link>
          <Link href="/register">
            <Button>Go to Register (Link)</Button>
          </Link>
        </div>
      </section>

      {/* Router Push Navigation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Using Router Push</h2>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/login')}>
            Go to Login (router.push)
          </Button>
          <Button onClick={() => router.push('/register')}>
            Go to Register (router.push)
          </Button>
        </div>
      </section>

      {/* Direct Navigation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Using Direct Navigation</h2>
        <div className="flex gap-4">
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login (direct)
          </Button>
          <Button onClick={() => window.location.href = '/register'}>
            Go to Register (direct)
          </Button>
        </div>
      </section>
    </div>
  );
} 