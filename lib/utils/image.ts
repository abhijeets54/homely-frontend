/**
 * Get the full image URL for a food item image
 * 
 * @param imageUrl - The image URL or filename
 * @returns The full image URL
 */
export const getFullImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '/placeholder-food.jpg';
  if (imageUrl.startsWith('http')) return imageUrl; // Cloudinary or other remote URL
  if (imageUrl.startsWith('/uploads/')) return imageUrl; // Legacy local URL
  return `/uploads/food/${imageUrl}`; // Legacy filename only
};

/**
 * Get the full image URL for a seller image
 * 
 * @param imageUrl - The image URL or filename
 * @returns The full image URL
 */
export const getSellerImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '/placeholder-restaurant.jpg';
  if (imageUrl.startsWith('http')) return imageUrl; // Cloudinary or other remote URL
  if (imageUrl.startsWith('/uploads/')) return imageUrl; // Legacy local URL
  return `/uploads/seller/${imageUrl}`; // Legacy filename only
};

/**
 * Format an image URL for sending to the backend
 * 
 * @param imageUrl - The image URL or filename
 * @returns The formatted image URL
 */
export const formatImageUrlForBackend = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith('http')) return imageUrl; // Cloudinary or other remote URL
  if (imageUrl.startsWith('/uploads/')) return imageUrl; // Legacy local URL
  return `/uploads/food/${imageUrl}`; // Legacy filename only
};

/**
 * Format a seller image URL for sending to the backend
 * 
 * @param imageUrl - The image URL or filename
 * @returns The formatted image URL
 */
export const formatSellerImageUrlForBackend = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith('http')) return imageUrl; // Cloudinary or other remote URL
  if (imageUrl.startsWith('/uploads/')) return imageUrl; // Legacy local URL
  return `/uploads/seller/${imageUrl}`; // Legacy filename only
};

/**
 * Get a Cloudinary URL with transformations
 * 
 * @param url - The original Cloudinary URL
 * @param options - Transformation options
 * @returns The transformed Cloudinary URL
 */
export const getOptimizedImageUrl = (
  url: string | undefined, 
  options: { width?: number; height?: number; crop?: string; quality?: number } = {}
): string => {
  if (!url || !url.includes('cloudinary.com')) return url || '';
  
  const { width = 500, height, crop = 'fill', quality = 'auto' } = options;
  
  // Extract the base URL and file path
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  // Build transformation string
  let transformations = `w_${width},c_${crop},q_${quality}`;
  if (height) transformations += `,h_${height}`;
  
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}; 