import { z } from 'zod';

// Category form validation schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Category name must be at least 2 characters' })
    .max(50, { message: 'Category name must be less than 50 characters' }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// Food item form validation schema
export const foodItemSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Food name must be at least 2 characters' })
    .max(100, { message: 'Food name must be less than 100 characters' }),
  categoryId: z
    .string()
    .min(1, { message: 'Category is required' }),
  price: z
    .number()
    .min(0.01, { message: 'Price must be greater than 0' })
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)),
  imageUrl: z
    .string()
    .min(1, { message: 'Image URL is required' }),
  isAvailable: z
    .boolean()
    .default(true),
  stock: z
    .number()
    .int()
    .min(0, { message: 'Stock cannot be negative' })
    .or(z.string().regex(/^\d+$/).transform(Number)),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(500, { message: 'Description must be less than 500 characters' }),
    dietaryInfo: z.array(z.string()),
});

export type FoodItemFormValues = z.infer<typeof foodItemSchema>; 