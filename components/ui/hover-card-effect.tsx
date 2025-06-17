'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HoverCardEffectProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  disabled?: boolean;
}

export function HoverCardEffect({
  children,
  className,
  glowColor = 'rgba(138, 43, 226, 0.2)', // Default purple glow
  intensity = 'medium',
  disabled = false,
}: HoverCardEffectProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Set intensity values
  const intensityValues = {
    subtle: { rotate: 1, translateY: -2, glow: 0.1 },
    medium: { rotate: 2, translateY: -4, glow: 0.2 },
    strong: { rotate: 3, translateY: -6, glow: 0.3 },
  };

  const { rotate, translateY, glow } = intensityValues[intensity];

  // Handle mouse move to update the transform effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || disabled) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate position relative to the card center
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    setPosition({ x, y });
  };

  // Reset position when not hovering
  const handleMouseLeave = () => {
    setIsHovering(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'transition-all duration-200 ease-out',
        !disabled && 'cursor-pointer',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      style={
        !disabled && isHovering
          ? {
              transform: `perspective(1000px) rotateY(${position.x / (30 / rotate)}deg) rotateX(${-position.y / (30 / rotate)}deg) translateY(${translateY}px)`,
              boxShadow: `0 ${5 + translateY}px 15px rgba(0, 0, 0, 0.1), 0 0 ${10 + translateY * 2}px ${glowColor}`,
              zIndex: 1,
            }
          : {}
      }
    >
      {children}
      
      {/* Subtle glow effect on hover */}
      {!disabled && (
        <div
          className={cn(
            'absolute inset-0 rounded-inherit transition-opacity duration-300',
            isHovering ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            background: `radial-gradient(circle at ${position.x + 50}% ${position.y + 50}%, ${glowColor} 0%, transparent 70%)`,
            opacity: isHovering ? glow : 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}

export default HoverCardEffect; 