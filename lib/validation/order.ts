import { z } from 'zod';

// Checkout form validation schema
export const checkoutSchema = z.object({
  deliveryAddress: z
    .string()
    .min(5, { message: 'Delivery address must be at least 5 characters' })
    .max(200, { message: 'Delivery address must be less than 200 characters' }),
  specialInstructions: z
    .string()
    .max(500, { message: 'Special instructions must be less than 500 characters' })
    .optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi'], {
    required_error: 'Please select a payment method',
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// Order status update validation schema
export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'out for delivery', 'delivered'], {
    required_error: 'Please select a status',
  }),
});

export type OrderStatusFormValues = z.infer<typeof orderStatusSchema>; 