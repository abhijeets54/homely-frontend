'use client';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/forms/login-form';
import { motion, Variants } from 'framer-motion';

export const metadata: Metadata = {
  title: 'Login | Homely',
  description: 'Login to your Homely account',
};

export default function LoginPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full lg:flex flex-col">
        {/* Left side with image and animated overlay */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')" }} />
        <motion.div 
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1 }}
        /> 
        
        {/* Animated Homely text in top left */}
        <motion.div 
          className="relative z-20 p-6"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">Homely</span>
          </Link>
        </motion.div>

        {/* Decorative floating elements */}
        <motion.div
          className="absolute bottom-10 left-10 z-10 w-20 h-20 rounded-full bg-primary/20"
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/4 right-10 z-10 w-16 h-16 rounded-full bg-primary/20"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
      </div>
      
      <div className="lg:p-8">
        <motion.div 
          className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex flex-col space-y-2 text-center"
            variants={itemVariants}
          >
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <LoginForm />
          </motion.div>
          
          <motion.p 
            className="px-8 text-center text-sm text-muted-foreground"
            variants={itemVariants}
          >
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
} 