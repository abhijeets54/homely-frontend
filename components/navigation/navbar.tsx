import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ShoppingCart, LogOut, Settings, Bell, User } from 'lucide-react';
import { NotificationsDropdown } from '@/components/features/notifications';

export function Navbar() {
  const { user, role, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-3 hidden md:flex">
          <Link href="/" className="mr-4 flex items-center space-x-2">
            <Image 
              src="https://res.cloudinary.com/dclkrotg8/image/upload/v1750333510/logo_z7h1hj.png" 
              alt="Homely" 
              width={80} 
              height={27} 
              className="h-auto"
            />
          </Link>
          <div className="flex gap-5 text-base font-medium">
            {role === 'customer' ? (
              <>
                <Link
                  href="/customer/dashboard"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Browse
                </Link>
              </>
            ) : role === 'seller' ? (
              <>
                <Link
                  href="/seller/dashboard"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Dashboard
                </Link>
                <Link
                  href="/seller/menu"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Menu
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Add search functionality here if needed */}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {role === 'customer' && (
                  <Link href="/customer/cart">
                    <Button variant="ghost" size="icon" className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {/* Add cart items count badge here */}
                    </Button>
                  </Link>
                )}
                
                {/* Notifications Dropdown */}
                <NotificationsDropdown />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    {role === 'seller' && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/seller/profile"
                          className="flex items-center"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/${role}/notifications`}
                        className="flex items-center"
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/${role}/settings`}
                        className="flex items-center"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center text-red-600"
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 