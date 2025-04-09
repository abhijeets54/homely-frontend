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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'seller', 'delivery'] as const),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const defaultRole = (searchParams.get('userType') as UserRole) || 'customer';
  // console.log('Default role:', defaultRole); // Ensure this is 'seller' when needed

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: defaultRole,
    },
  });

  const selectedRole = watch('role');
  // console.log('Selected role:', selectedRole); // Log the selected role

  const onSubmit = async (data: LoginFormData) => {
    console.log('Current form errors:', errors); // Log current form errors // Log the form state before submission
    console.log('Form state:', { errors, isLoading }); // Log the entire form state
    console.log('Form submitted with data:', data); // Log the submitted data
    console.log('Selected role:', selectedRole); // Log the selected role
    try {
      setIsLoading(true);
      
      // Log the data being sent for debugging
      console.log('Login data:', data);
      
      // Call the login function from the auth context
      await login(data);
      
      // If we get here, login was successful
      // Note: The redirect is handled in the AuthProvider
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Failed to login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-4"
       // Log when the form is clicked
    >
      <RadioGroup
        value={selectedRole} // Bind the selected role
        onValueChange={(value) => setValue('role', value as UserRole)} // Explicitly cast the value
        className="grid grid-cols-3 gap-4 mb-4"
      >
        <div>
          <RadioGroupItem value="customer" id="customer" className="peer sr-only" />
          <Label
            htmlFor="customer"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="text-sm font-medium">Customer</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="seller" id="seller" className="peer sr-only" />
          <Label
            htmlFor="seller"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="text-sm font-medium">Seller</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
          <Label
            htmlFor="delivery"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="text-sm font-medium">Delivery Partner</span>
          </Label>
        </div>
      </RadioGroup>

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
          placeholder="Enter your password"
          type="password"
          autoComplete="current-password"
          disabled={isLoading}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button className="w-full" type="submit" disabled={isLoading} onClick={() => console.log('Button clicked, disabled state:', isLoading)}>
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}