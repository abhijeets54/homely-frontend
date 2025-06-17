'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './button';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageSrc: string;
  imageAlt: string;
}

export function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  imageSrc,
  imageAlt,
}: HeroSectionProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  // Floating elements for background decoration
  const floatingElements = [
    { top: '10%', left: '5%', size: 40, delay: 0, duration: 3 },
    { top: '70%', left: '10%', size: 25, delay: 1, duration: 4 },
    { top: '20%', left: '85%', size: 35, delay: 0.5, duration: 3.5 },
    { top: '80%', left: '80%', size: 30, delay: 1.5, duration: 4.5 },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-secondary to-secondary-light py-20">
      {/* Decorative floating elements */}
      {floatingElements.map((el, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-primary/10 z-0"
          style={{
            top: el.top,
            left: el.left,
            width: el.size,
            height: el.size,
          }}
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: el.delay,
          }}
        />
      ))}

      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
        <motion.div
          className="md:w-1/2 mb-10 md:mb-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
            variants={itemVariants}
          >
            {title}
          </motion.h1>
          
          <motion.p 
            className="text-lg text-gray-600 mb-8"
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            variants={itemVariants}
          >
            <Button size="lg" asChild>
              <Link href={ctaLink}>{ctaText}</Link>
            </Button>
            
            {secondaryCtaText && secondaryCtaLink && (
              <Button size="lg" variant="outline" asChild>
                <Link href={secondaryCtaLink}>{secondaryCtaText}</Link>
              </Button>
            )}
          </motion.div>
        </motion.div>
        
        <motion.div
          className="md:w-1/2 relative"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-xl"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              priority
            />
            
            {/* Animated overlay gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"
              animate={{
                opacity: [0.4, 0.2, 0.4],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 