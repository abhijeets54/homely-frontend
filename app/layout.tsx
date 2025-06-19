import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/providers/auth-provider';
import { CartProvider } from '@/components/providers/cart-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LoadingProvider } from '@/components/providers/loading-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Homely - Home-cooked Food Delivery',
  description: 'Order delicious home-cooked meals from local chefs in your area.',
  icons: {
    icon: 'https://res.cloudinary.com/dclkrotg8/image/upload/v1750333510/logo_z7h1hj.png',
    apple: 'https://res.cloudinary.com/dclkrotg8/image/upload/v1750333510/logo_z7h1hj.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://res.cloudinary.com/dclkrotg8/image/upload/v1750333510/logo_z7h1hj.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                <LoadingProvider>
                  <div className="min-h-screen flex flex-col">
                    <main className="flex-1">
                      {children}
                    </main>
                  </div>
                  <Toaster />
                </LoadingProvider>
              </CartProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
