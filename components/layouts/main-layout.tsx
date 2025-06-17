'use client';

import React, { ReactNode } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import PageTransition from '../ui/page-transition';

interface MainLayoutProps {
  children: ReactNode;
  transitionType?: 'fade' | 'slide' | 'zoom';
}

export function MainLayout({ 
  children, 
  transitionType = 'fade' 
}: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <PageTransition transitionType={transitionType}>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
} 