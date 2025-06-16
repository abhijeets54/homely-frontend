'use client';

import React from 'react';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/utils/cloudinary-loader';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  style?: React.CSSProperties;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * CloudinaryImage component for optimized image delivery
 * Wraps Next.js Image component with Cloudinary loader
 */
export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  priority,
  quality,
  fill,
  style,
  objectFit,
  placeholder,
  blurDataURL,
}: CloudinaryImageProps) {
  // If src is not provided or is empty, show a placeholder
  if (!src) {
    src = '/placeholder-food.jpg';
  }

  // Set default width and height if not provided and fill is not true
  if (!fill && (!width || !height)) {
    width = width || 500;
    height = height || 300;
  }

  // Combine style with objectFit if provided
  const combinedStyle = {
    ...style,
    ...(objectFit && { objectFit }),
  };

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      quality={quality}
      fill={fill}
      style={combinedStyle}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      loader={cloudinaryLoader}
    />
  );
} 