'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TestAuthStatusPage() {
  const { user, role, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [cookies, setCookies] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    // Get all cookies to display
    const cookieObj: {[key: string]: string} = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name) cookieObj[name] = value || '';
    });
    setCookies(cookieObj);
  }, []);
  
  const handleLogout = async () => {
    await logout();
    // Redirect handled by auth provider
  };
  
  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Authentication Status Test Page</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h2 className="font-semibold text-xl mb-4">Auth State</h2>
        <div className="space-y-2">
          <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User Role:</strong> {role || 'Not logged in'}</p>
        </div>
      </div>
      
      {isAuthenticated && user && (
        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <h2 className="font-semibold text-xl mb-4">User Information</h2>
          <pre className="bg-white p-4 rounded overflow-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h2 className="font-semibold text-xl mb-4">Authentication Cookies</h2>
        <div className="bg-white p-4 rounded overflow-auto text-sm">
          <pre>{JSON.stringify(cookies, null, 2)}</pre>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        {isAuthenticated ? (
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        ) : (
          <>
            <Button onClick={() => router.push('/login')} variant="default">
              Go to Login
            </Button>
            <Button onClick={() => router.push('/register')} variant="outline">
              Go to Register
            </Button>
          </>
        )}
        
        <Link href="/test-login" className="ml-4">
          <Button variant="outline">Test Login Page</Button>
        </Link>
        
        <Link href="/test-register" className="ml-4">
          <Button variant="outline">Test Register Page</Button>
        </Link>
      </div>
    </div>
  );
} 