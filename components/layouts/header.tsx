'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/components/providers/cart-provider';
import { ImprovedCartSheet } from '@/components/features/cart/improved-cart-sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { formatPrice } from '@/lib/utils/format';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function Header() {
  const pathname = usePathname();
  const { user, role, isAuthenticated, isLoading, logout } = useAuth();
  const { cartItems, totalItems, totalPrice } = useCart();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if the current path matches the given path
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Log user role
  // console.log('User role:', role);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-primary">Homely</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/" 
            className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/sellers" 
            className={`nav-link ${isActive('/sellers') ? 'nav-link-active' : ''}`}
          >
            Sellers
          </Link>
          {isAuthenticated && role === 'customer' && (
            <>
              <Link 
                href="/customer/dashboard" 
                className={`nav-link ${isActive('/customer/dashboard') ? 'nav-link-active' : ''}`}
              >
                Dashboard
              </Link>
            </>
          )}
          {isAuthenticated && role === 'seller' && (
            <>
              <Link 
                href="/seller/dashboard" 
                className={`nav-link ${isActive('/seller/dashboard') ? 'nav-link-active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/seller/menu" 
                className={`nav-link ${isActive('/seller/menu') ? 'nav-link-active' : ''}`}
              >
                Menu
              </Link>
            </>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Cart (only for customers) */}
          {(!role || role === 'customer') && (
            <ImprovedCartSheet />
          )}

          {/* Authentication */}
          {isLoading ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : !isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${role}/dashboard`}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}