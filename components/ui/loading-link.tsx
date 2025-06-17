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
  ...props
}: LoadingLinkProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const router = useRouter();
  const { startLoading } = useLoadingState();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call the provided onClick handler if any
    if (onClick) onClick();
    
    // Let the default navigation happen
    // The loading provider will detect the navigation and show the loader
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