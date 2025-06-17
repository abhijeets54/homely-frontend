'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transitionType?: 'fade' | 'slide' | 'zoom';
}

export function PageTransition({
  children,
  className,
  transitionType = 'fade',
}: PageTransitionProps) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  // Define transition classes based on type
  const transitionClasses = {
    fade: 'animate-fade-in',
    slide: 'animate-slide-in-right',
    zoom: 'animate-zoom-in',
  };

  useEffect(() => {
    // When path changes, trigger animation
    setIsAnimating(true);
    // After animation completes, update the displayed children
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setIsAnimating(false);
    }, 300); // Match this to your animation duration

    return () => clearTimeout(timeout);
  }, [pathname, children]);

  return (
    <div
      className={cn(
        'transition-all duration-300 opacity-0',
        isAnimating ? 'opacity-0' : transitionClasses[transitionType],
        className
      )}
      style={{ animationFillMode: 'forwards' }}
    >
      {displayChildren}
    </div>
  );
}

export default PageTransition; 