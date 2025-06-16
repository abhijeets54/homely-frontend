import React from 'react';
import { MainLayout } from '@/components/layouts';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
} 