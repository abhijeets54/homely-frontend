'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type AnimationVariant = 
  | 'fade-in'
  | 'fade-in-up'
  | 'fade-in-down'
  | 'fade-in-left'
  | 'fade-in-right'
  | 'zoom-in'
  | 'slide-in-right'
  | 'slide-in-left';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  animation: AnimationVariant;
  className?: string;
  delay?: number; // delay in ms
  threshold?: number; // threshold for intersection observer (0-1)
  once?: boolean; // whether to animate only once
}

export function AnimateOnScroll({
  children,
  animation,
  className,
  delay = 0,
  threshold = 0.1,
  once = true,
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If we've already animated and once is true, don't animate again
        if (hasAnimated && once) return;
        
        if (entry.isIntersecting) {
          // Delay the animation if specified
          if (delay) {
            setTimeout(() => {
              setIsVisible(true);
              if (once) setHasAnimated(true);
            }, delay);
          } else {
            setIsVisible(true);
            if (once) setHasAnimated(true);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay, hasAnimated, once, threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        'opacity-0',
        isVisible && `animate-${animation}`,
        className
      )}
      style={{ 
        animationDelay: delay ? `${delay}ms` : undefined,
        animationFillMode: 'forwards' 
      }}
    >
      {children}
    </div>
  );
}

export default AnimateOnScroll; 