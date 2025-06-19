'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/hooks/use-auth';
import { Icons } from '@/components/ui/icons';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  title: string;
  href: string;
  icon: keyof typeof Icons;
}

interface NavProps {
  items: NavItem[];
}

const customerNavItems: NavItem[] = [
  {
    title: 'Favorites',
    href: '/customer/favorites',
    icon: 'heart',
  },
  {
    title: 'Addresses',
    href: '/customer/addresses',
    icon: 'mapPin',
  },
  {
    title: 'Settings',
    href: '/customer/settings',
    icon: 'settings',
  },
];

const sellerNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/seller/dashboard',
    icon: 'dashboard',
  },
  {
    title: 'Menu',
    href: '/seller/menu',
    icon: 'menu',
  },
  {
    title: 'Analytics',
    href: '/seller/analytics',
    icon: 'analytics',
  },
  {
    title: 'Profile',
    href: '/seller/profile',
    icon: 'user',
  },
  {
    title: 'Settings',
    href: '/seller/settings',
    icon: 'settings',
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, role } = useAuth();

  const navItems = role === 'seller' ? sellerNavItems : customerNavItems;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden">
              <Icons.menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 pr-0">
            <MobileNav items={navItems} setOpen={setOpen} />
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-8 w-8" />
            <Image 
              src="/uploads/logo.png" 
              alt="Homely" 
              width={100} 
              height={30} 
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex-1" />
          <UserNav />
        </div>
      </header>
      <div className="flex-1 items-start lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
        <aside className="fixed top-16 z-30 hidden h-[calc(100vh-4rem)] w-72 border-r bg-background lg:block">
          <ScrollArea className="h-full py-6 pl-4 pr-6">
            <Nav items={navItems} />
          </ScrollArea>
        </aside>
        <main className="flex w-full flex-col overflow-hidden lg:pl-72">
          <div className="container flex-1 p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

interface MobileNavProps extends NavProps {
  setOpen: (open: boolean) => void;
}

function MobileNav({ items, setOpen }: MobileNavProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Link
        href="/"
        className="flex items-center gap-2"
        onClick={() => setOpen(false)}
      >
        <Icons.logo className="h-6 w-6" />
        <Image 
          src="/uploads/logo.png" 
          alt="Homely" 
          width={100} 
          height={30} 
          className="h-6 w-auto"
        />
      </Link>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = Icons[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 text-sm"
              onClick={() => setOpen(false)}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Nav({ items }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {items.map((item) => {
        const Icon = Icons[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
              pathname === item.href ? 'bg-accent' : 'transparent'
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserNav() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon">
        <Icons.bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>
      <Button variant="ghost" size="icon">
        <Icons.settings className="h-5 w-5" />
        <span className="sr-only">Settings</span>
      </Button>
      <Button variant="ghost" size="icon">
        <Icons.user className="h-5 w-5" />
        <span className="sr-only">Account</span>
      </Button>
    </div>
  );
} 