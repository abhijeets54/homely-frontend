'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FoodLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'plate' | 'cooking' | 'delivery' | 'pizza' | 'burger';
  className?: string;
  text?: string;
}

const FoodLoader = ({ 
  size = 'md', 
  variant = 'plate', 
  className = '',
  text
}: FoodLoaderProps) => {
  // Size mappings
  const sizeMap = {
    sm: {
      container: 'w-16 h-16',
      text: 'text-xs',
    },
    md: {
      container: 'w-24 h-24',
      text: 'text-sm',
    },
    lg: {
      container: 'w-32 h-32',
      text: 'text-base',
    },
  };

  // Plate Loader - Spinning plate with utensils
  if (variant === 'plate') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className={`relative ${sizeMap[size].container}`}>
          {/* Plate */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
            animate={{ rotate: [0, 10, 0, -10, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          {/* Fork */}
          <motion.div 
            className="absolute h-1 w-8 bg-gray-400 dark:bg-gray-500 rounded-full"
            style={{ 
              top: '40%', 
              left: '50%', 
              translateX: '-50%',
              transformOrigin: 'center',
            }}
            animate={{ rotate: 45, x: -5, y: -5 }}
          />
          {/* Knife */}
          <motion.div 
            className="absolute h-1 w-8 bg-gray-400 dark:bg-gray-500 rounded-full"
            style={{ 
              top: '40%', 
              left: '50%', 
              translateX: '-50%',
              transformOrigin: 'center',
            }}
            animate={{ rotate: -45, x: 5, y: -5 }}
          />
          {/* Food item (circle in the middle) */}
          <motion.div 
            className="absolute w-1/3 h-1/3 bg-primary rounded-full"
            style={{ 
              top: '50%', 
              left: '50%', 
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
        <p className={`mt-4 font-medium text-foreground ${sizeMap[size].text}`}>
          {text || 'Preparing your meal...'}
        </p>
      </div>
    );
  }

  // Cooking Loader - Bubbling pot
  if (variant === 'cooking') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className={`relative ${sizeMap[size].container}`}>
          {/* Pot */}
          <div className="absolute bottom-0 w-full h-3/4 bg-gray-400 dark:bg-gray-600 rounded-b-xl rounded-t-md" />
          
          {/* Pot handles */}
          <div className="absolute w-full flex justify-between" style={{ top: '40%' }}>
            <div className="w-2 h-4 bg-gray-500 dark:bg-gray-700 rounded-full -ml-1" />
            <div className="w-2 h-4 bg-gray-500 dark:bg-gray-700 rounded-full -mr-1" />
          </div>
          
          {/* Pot lid */}
          <motion.div 
            className="absolute w-[110%] h-2 bg-gray-500 dark:bg-gray-700 rounded-full"
            style={{ top: '30%', left: '-5%' }}
            animate={{ 
              y: [0, -2, 0],
              rotate: [0, 1, 0, -1, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          
          {/* Steam bubbles */}
          <div className="absolute w-full flex justify-center" style={{ top: '15%' }}>
            {[0, 1, 2].map((i) => (
              <motion.div 
                key={i}
                className="mx-1 bg-primary/60 rounded-full"
                style={{ width: '20%', height: '20%' }}
                animate={{ 
                  y: [0, -15, -30],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.8]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeOut",
                  delay: i * 0.4
                }}
              />
            ))}
          </div>
        </div>
        <p className={`mt-4 font-medium text-foreground ${sizeMap[size].text}`}>
          {text || 'Cooking in progress...'}
        </p>
      </div>
    );
  }

  // Delivery Loader - Moving delivery vehicle
  if (variant === 'delivery') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className={`relative ${sizeMap[size].container}`}>
          {/* Road */}
          <div className="absolute bottom-0 w-full h-1 bg-gray-300 dark:bg-gray-700" />
          
          {/* Delivery vehicle */}
          <motion.div 
            className="absolute bottom-1"
            animate={{ 
              x: [-50, 50],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse",
              ease: "easeInOut" 
            }}
          >
            {/* Vehicle body */}
            <div className="w-10 h-5 bg-primary rounded-md" />
            
            {/* Vehicle cabin */}
            <div className="absolute top-0 left-0 w-4 h-3 bg-primary/80 rounded-t-md" />
            
            {/* Wheels */}
            <motion.div 
              className="absolute -bottom-1 left-1 w-2 h-2 bg-gray-800 dark:bg-gray-900 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute -bottom-1 right-1 w-2 h-2 bg-gray-800 dark:bg-gray-900 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
        <p className={`mt-4 font-medium text-foreground ${sizeMap[size].text}`}>
          {text || 'Your order is on the way...'}
        </p>
      </div>
    );
  }

  // Pizza Loader - Spinning pizza with toppings
  if (variant === 'pizza') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className={`relative ${sizeMap[size].container}`}>
          {/* Pizza base */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-200 dark:border-yellow-800"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {/* Pizza crust */}
            <div className="absolute inset-1 rounded-full border-2 border-yellow-300 dark:border-yellow-700" />
            
            {/* Toppings */}
            <div className="absolute inset-4 flex items-center justify-center">
              <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ top: '20%', left: '30%' }} />
              <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ top: '40%', left: '60%' }} />
              <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ top: '70%', left: '40%' }} />
              <div className="absolute w-1.5 h-1.5 bg-green-700 rounded-full" style={{ top: '30%', left: '50%' }} />
              <div className="absolute w-1.5 h-1.5 bg-green-700 rounded-full" style={{ top: '60%', left: '25%' }} />
            </div>
          </motion.div>
        </div>
        <p className={`mt-4 font-medium text-foreground ${sizeMap[size].text}`}>
          {text || 'Baking your pizza...'}
        </p>
      </div>
    );
  }

  // Burger Loader - Stacking burger layers
  if (variant === 'burger') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className={`relative ${sizeMap[size].container}`}>
          {/* Bottom bun */}
          <div className="absolute w-full h-1/5 bg-yellow-300 dark:bg-yellow-700 rounded-b-xl bottom-0" />
          
          {/* Burger layers */}
          <motion.div 
            className="absolute w-full h-1/6 bg-amber-800 dark:bg-amber-900 bottom-[20%]"
            animate={{ 
              y: [0, -2, 0],
              x: [0, 1, 0, -1, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.2
            }}
          />
          
          <motion.div 
            className="absolute w-full h-1/6 bg-green-500 dark:bg-green-700 bottom-[calc(20%+16.7%)]"
            animate={{ 
              y: [0, -4, 0],
              x: [0, 2, 0, -2, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.4
            }}
          />
          
          <motion.div 
            className="absolute w-full h-1/6 bg-red-500 dark:bg-red-700 bottom-[calc(20%+33.4%)]"
            animate={{ 
              y: [0, -6, 0],
              x: [0, 3, 0, -3, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.6
            }}
          />
          
          {/* Top bun */}
          <motion.div 
            className="absolute w-full h-1/4 bg-yellow-300 dark:bg-yellow-700 rounded-t-3xl bottom-[calc(20%+50%)]"
            animate={{ 
              y: [0, -8, 0],
              x: [0, 4, 0, -4, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.8
            }}
          />
        </div>
        <p className={`mt-4 font-medium text-foreground ${sizeMap[size].text}`}>
          {text || 'Assembling your burger...'}
        </p>
      </div>
    );
  }

  // Default fallback - simple spinning plate
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${sizeMap[size].container}`}>
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-800"
          style={{ borderTopColor: 'var(--primary)' }}
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      </div>
      <p className={`mt-4 font-medium text-foreground ${sizeMap[size].text}`}>
        {text || 'Loading...'}
      </p>
    </div>
  );
};

export default FoodLoader; 