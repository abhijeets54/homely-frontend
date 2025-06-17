import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price to a string with currency.
 * @param price - The price to format.
 * @returns Formatted price string.
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Format date to a readable string.
 * @param date - The date to format.
 * @returns Formatted date string.
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}
