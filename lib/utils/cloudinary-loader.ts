'use client';

/**
 * Cloudinary image loader for Next.js
 * This loader constructs URLs for Cloudinary-hosted images
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // If the source is already a complete URL (including Cloudinary URL), use it directly
  if (src.startsWith('http')) {
    // For existing Cloudinary URLs, we can add transformations
    if (src.includes('cloudinary.com')) {
      // Extract the base URL and file path
      const parts = src.split('/upload/');
      if (parts.length === 2) {
        // Add transformations
        const params = [`w_${width}`, `c_fill`, `q_${quality || 'auto'}`];
        return `${parts[0]}/upload/${params.join(',')}/${parts[1]}`;
      }
    }
    // For other URLs, return as is
    return src;
  }

  // For local images (from /public), return as is
  if (src.startsWith('/')) {
    return src;
  }

  // For Cloudinary public IDs (without http/https), construct the URL
  // Format: cloudinary.com/cloud_name/image/upload/transformations/public_id
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dclkrotg8';
  const params = [`w_${width}`, `c_fill`, `q_${quality || 'auto'}`];
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${params.join(',')}/${src}`;
} 