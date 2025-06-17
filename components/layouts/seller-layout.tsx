'use client';

import { useAuth } from '@/lib/context/auth-context';
import { Navbar } from '@/components/navigation/navbar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChefHat,
  Home,
  Menu as MenuIcon,
  Settings,
  Store,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/seller/dashboard',
    icon: Home,
  },
  {
    title: 'Menu Management',
    href: '/seller/menu',
    icon: MenuIcon,
  },
  {
    title: 'Profile',
    href: '/seller/profile',
    icon: User,
  },
  {
    title: 'Store Settings',
    href: '/seller/settings',
    icon: Settings,
  },
];

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 mt-16 border-r bg-white">
          <div className="flex-1 flex flex-col min-h-0 pt-5">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <ChefHat className="h-6 w-6 text-primary mr-2" />
              <span className="text-lg font-semibold">Seller Dashboard</span>
            </div>
            <nav className="flex-1 px-2 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-white' : 'text-gray-400'
                      )}
                    />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center w-full">
              <Store className="h-8 w-8 text-gray-400 mr-3" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="lg:hidden fixed top-3 left-2 z-50"
              size="icon"
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center">
                <ChefHat className="h-6 w-6 text-primary mr-2" />
                <span>Seller Dashboard</span>
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-5rem)]">
              <div className="p-4 space-y-4">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      <Icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isActive ? 'text-white' : 'text-gray-400'
                        )}
                      />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <main className="flex-1 lg:pl-64 pt-16">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 