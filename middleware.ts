import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    // Get the pathname from the URL
    const pathname = request.nextUrl.pathname;
    
    const token = request.cookies.get('token')?.value;
    const userType = request.cookies.get('userType')?.value;

    // Public paths that don't require authentication
    const publicPaths = ['/', '/about', '/contact', '/test-routing', '/sellers', '/checkout/success', '/terms', '/privacy'];
    const isPublicPath = publicPaths.some(path => 
      pathname === path || 
      pathname.startsWith('/sellers/') ||
      pathname.startsWith('/menu/') ||
      pathname.startsWith('/checkout/')
    );

    // Debug logging (optional - can be removed in production)
    console.log(`Middleware: Path: ${pathname}, Token: ${token ? 'exists' : 'none'}, UserType: ${userType || 'undefined'}, IsPublicPath: ${isPublicPath}`);

    // Check if the path is an auth path (login or register)
    const isAuthPath = pathname === '/login' || pathname === '/register';

    // API routes should be handled by the API middleware
    if (pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    // Test pages should be accessible
    if (pathname.startsWith('/test-') || 
        pathname.startsWith('/cors-') || 
        pathname.startsWith('/backend-check') || 
        pathname.startsWith('/api-test')) {
      return NextResponse.next();
    }

    // If the path is login or register
    if (isAuthPath) {
      // If user is already authenticated, redirect to appropriate dashboard
      if (token && userType) {
        const redirectUrl = new URL(
          userType === 'seller' ? '/seller/dashboard' : 
          userType === 'customer' ? '/customer/dashboard' : '/',
          request.url
        );
        return NextResponse.redirect(redirectUrl);
      }
      // Allow unauthenticated users to access auth pages
      return NextResponse.next();
    }

    // Allow access to public paths for all users (authenticated or not)
    if (isPublicPath) {
      return NextResponse.next();
    }

    // If user is not authenticated and tries to access protected routes
    if (!token) {
      const searchParams = new URLSearchParams({
        redirectTo: pathname,
      });
      const loginUrl = new URL(`/login?${searchParams}`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // If token exists but userType is missing, redirect to login
    if (!userType) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    const isSellerRoute = pathname.startsWith('/seller');
    const isCustomerRoute = pathname.startsWith('/customer');

    // Redirect users based on their role
    if (userType === 'seller') {
      if (!isSellerRoute && !isPublicPath) {
        return NextResponse.redirect(new URL('/seller/dashboard', request.url));
      }
    } else if (userType === 'customer') {
      if (isSellerRoute && !isPublicPath) {
        return NextResponse.redirect(new URL('/customer/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 