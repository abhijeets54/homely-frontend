'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoadingState } from '@/lib/hooks/use-loading';

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  onClick?: () => void;
  loadingDelay?: number;
}

/**
 * A wrapper around Next.js Link that shows the loading indicator during navigation
 */
export function LoadingLink({
  href,
  children,
  className,
  prefetch = true,
  onClick,
  loadingDelay = 300,
  ...props
}: LoadingLinkProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const router = useRouter();
  const { startLoading } = useLoadingState();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Call the provided onClick handler if any
    if (onClick) onClick();
    
    // Start the loading animation
    startLoading();
    
    // Navigate after a small delay to ensure the loader is visible
    setTimeout(() => {
      router.push(href);
    }, loadingDelay);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </Link>
  );
}

export default LoadingLink; 