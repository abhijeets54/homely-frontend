'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { UserRole } from '@/lib/types';
import { Icons } from '@/components/ui/icons';

// Define a more specific role type for registration
type RegisterRole = 'customer' | 'seller';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number').max(15, 'Phone number is too long'),
  address: z.string().min(5, 'Please enter your complete address'),
  role: z.enum(['customer', 'seller'] as const),
  imageUrl: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Convert any role to a valid register role
  const getValidRole = (role: string | null): RegisterRole => {
    if (role === 'customer' || role === 'seller') {
      return role;
    }
    return 'customer'; // Default to customer for any other role
  };

  const defaultRole = getValidRole(searchParams.get('userType'));

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      
      // Log the data being sent for debugging
      console.log('Registration data:', data);
      
      // Call the register function from the auth context
      await registerUser(data);
      
      // Success toast
      toast({
        title: 'Success',
        description: 'Your account has been created successfully.',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Display more specific error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please check if the backend server is running.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid registration data. Please check your inputs.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      }
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="mb-4">
        <Label className="block mb-2">Account Type</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="customer"
              className={`flex flex-col items-center justify-between rounded-md border-2 ${
                selectedRole === 'customer' ? 'border-primary' : 'border-muted'
              } bg-transparent p-4 hover:bg-muted cursor-pointer`}
            >
              <input
                type="radio"
                id="customer"
                value="customer"
                className="sr-only"
                {...register('role')}
              />
              <span className="text-sm font-medium">Customer</span>
            </Label>
          </div>
          <div>
            <Label
              htmlFor="seller"
              className={`flex flex-col items-center justify-between rounded-md border-2 ${
                selectedRole === 'seller' ? 'border-primary' : 'border-muted'
              } bg-transparent p-4 hover:bg-muted cursor-pointer`}
            >
              <input
                type="radio"
                id="seller"
                value="seller"
                className="sr-only"
                {...register('role')}
              />
              <span className="text-sm font-medium">Seller</span>
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter your full name"
          disabled={isLoading}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="Enter your email"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          disabled={isLoading}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          placeholder="Create a password"
          type="password"
          autoComplete="new-password"
          disabled={isLoading}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          placeholder="Confirm your password"
          type="password"
          autoComplete="new-password"
          disabled={isLoading}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          placeholder="Enter your phone number"
          type="tel"
          disabled={isLoading}
          {...register('phoneNumber')}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          {selectedRole === 'seller' ? 'Business Address' : 'Delivery Address'}
        </Label>
        <Input
          id="address"
          placeholder={`Enter your ${selectedRole === 'seller' ? 'business' : 'delivery'} address`}
          disabled={isLoading}
          {...register('address')}
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      {selectedRole === 'seller' && (
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Restaurant Cover Image</Label>
          <Input
            id="imageUrl"
            placeholder="Enter image filename (e.g. restaurant.jpg)"
            disabled={isLoading}
            {...register('imageUrl')}
          />
          <p className="text-xs text-muted-foreground">
            Enter just the filename. The image should be in the uploads/seller folder.
          </p>
        </div>
      )}

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
} 