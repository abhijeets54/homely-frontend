'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FoodPatternBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'light' | 'dark' | 'warm';
  withOverlay?: boolean;
}

export function FoodPatternBackground({
  children,
  className,
  variant = 'default',
  withOverlay = false,
}: FoodPatternBackgroundProps) {
  // Define background colors based on variant
  const bgColors = {
    default: 'bg-secondary/50',
    light: 'bg-cream-light',
    dark: 'bg-primary-dark/10',
    warm: 'bg-spice-light/10',
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Pattern background */}
      <div 
        className={cn(
          'absolute inset-0 bg-food-pattern opacity-10',
          bgColors[variant]
        )}
        aria-hidden="true"
      />
      
      {/* Optional overlay */}
      {withOverlay && (
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80"
          aria-hidden="true"
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default FoodPatternBackground; 