'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/components/providers/cart-provider';
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
              <Link 
                href="/customer/orders" 
                className={`nav-link ${isActive('/customer/orders') ? 'nav-link-active' : ''}`}
              >
                Orders
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
              <Link 
                href="/seller/orders" 
                className={`nav-link ${isActive('/seller/orders') ? 'nav-link-active' : ''}`}
              >
                Orders
              </Link>
            </>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Cart (only for customers) */}
          {(!role || role === 'customer') && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  Cart
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                  <SheetDescription>
                    Your shopping cart items
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                  {totalItems === 0 ? (
                    <p className="py-6 text-center text-gray-500">Your cart is empty</p>
                  ) : (
                    <div className="mt-4">
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{item.foodItem?.name}</p>
                              <p className="text-sm text-gray-500">
                                {item.quantity} x {formatPrice(item.price)}
                              </p>
                            </div>
                            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between font-semibold">
                          <p>Total</p>
                          <p>{formatPrice(totalPrice)}</p>
                        </div>
                        <Button className="w-full mt-4" asChild>
                          <Link href="/checkout">Checkout</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
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
                  <Link href={`/${role}/profile`}>Profile</Link>
                </DropdownMenuItem>
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