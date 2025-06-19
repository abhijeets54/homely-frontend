import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { RegisterForm } from '@/components/forms/register-form';

export const metadata: Metadata = {
  title: 'Register | Homely',
  description: 'Create a new account on Homely',
};

export default function RegisterPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full lg:flex flex-col">
        {/* Left side with image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay for better text visibility */}
        
        {/* Homely logo in top left */}
        <div className="relative z-20 p-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="https://res.cloudinary.com/dclkrotg8/image/upload/v1750333510/logo_z7h1hj.png" 
              alt="Homely" 
              width={180} 
              height={60} 
              className="h-auto"
            />
          </Link>
        </div>
      </div>
      
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Choose your role and enter your details to get started
            </p>
          </div>
          <RegisterForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 