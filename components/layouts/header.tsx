'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import LoadingLink from '@/components/ui/loading-link';

export function Header() {
  const pathname = usePathname();
  const { user, role, isAuthenticated, isLoading, logout } = useAuth();
  const { cartItems, totalItems, totalPrice } = useCart();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md py-2' 
          : 'bg-white py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <LoadingLink href="/" className="flex items-center group">
          <div className="mr-2 relative w-8 h-8 overflow-hidden">
            <div className="absolute inset-0 bg-primary rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute inset-0 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent group-hover:from-primary-dark group-hover:to-primary transition-all duration-300">
            Homely
          </span>
        </LoadingLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {[
            { path: '/', label: 'Home' },
            { path: '/sellers', label: 'Sellers' },
            ...(isAuthenticated && role === 'customer' ? [{ path: '/customer/dashboard', label: 'Dashboard' }] : []),
            ...(isAuthenticated && role === 'seller' ? [
              { path: '/seller/dashboard', label: 'Dashboard' },
              { path: '/seller/menu', label: 'Menu' }
            ] : [])
          ].map((item, index) => (
            <LoadingLink 
              key={item.path}
              href={item.path} 
              className={`relative px-2 py-1 font-medium transition-colors duration-200
                ${isActive(item.path) 
                  ? 'text-primary' 
                  : 'text-gray-700 hover:text-primary'
                }
              `}
            >
              {item.label}
              {isActive(item.path) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-pulse-light" />
              )}
            </LoadingLink>
          ))}
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
            <div className="hidden md:flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="border-primary hover:bg-primary/10 transition-all duration-300"
              >
                <LoadingLink href="/login">Login</LoadingLink>
              </Button>
              <Button 
                size="sm" 
                asChild
                className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary transition-all duration-300"
              >
                <LoadingLink href="/register">Register</LoadingLink>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full overflow-hidden relative group">
                  <Avatar className="border-2 border-transparent group-hover:border-primary transition-all duration-300">
                    {user?.imageUrl ? (
                      <AvatarImage src={user.imageUrl} alt={user.name || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="absolute inset-0 rounded-full bg-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 animate-fade-in-down">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {role === 'seller' && (
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 transition-colors">
                    <LoadingLink href="/seller/profile" className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </LoadingLink>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 transition-colors">
                  <LoadingLink href={`/${role}/dashboard`} className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </LoadingLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logout()}
                  className="cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-4">
                  <LoadingLink 
                    href="/" 
                    className={`px-2 py-2 rounded-md ${isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </LoadingLink>
                  <LoadingLink 
                    href="/sellers" 
                    className={`px-2 py-2 rounded-md ${isActive('/sellers') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sellers
                  </LoadingLink>
                  
                  {isAuthenticated ? (
                    <>
                      {role === 'customer' && (
                        <LoadingLink 
                          href="/customer/dashboard" 
                          className={`px-2 py-2 rounded-md ${isActive('/customer/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </LoadingLink>
                      )}
                      {role === 'seller' && (
                        <>
                          <LoadingLink 
                            href="/seller/dashboard" 
                            className={`px-2 py-2 rounded-md ${isActive('/seller/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Dashboard
                          </LoadingLink>
                          <LoadingLink 
                            href="/seller/menu" 
                            className={`px-2 py-2 rounded-md ${isActive('/seller/menu') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Menu
                          </LoadingLink>
                        </>
                      )}
                      <div className="pt-4 mt-4 border-t border-gray-200">
                        <Button 
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                          variant="destructive"
                          className="w-full"
                        >
                          Logout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="pt-4 mt-4 border-t border-gray-200 flex flex-col space-y-3">
                      <Button 
                        asChild
                        className="w-full bg-gradient-to-r from-primary to-primary-dark"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LoadingLink href="/login">Login</LoadingLink>
                      </Button>
                      <Button 
                        asChild
                        variant="outline"
                        className="w-full border-primary hover:bg-primary/10"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LoadingLink href="/register">Register</LoadingLink>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}