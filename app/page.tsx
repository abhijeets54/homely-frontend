'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { foodApi } from '../lib/api';
import { MainLayout } from '../components/layouts';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Seller } from '../lib/types/models';
import { getSellerImageUrl } from '@/lib/utils/image';
import CloudinaryImage from '@/components/CloudinaryImage';
import ContactForm from '@/components/features/contact/contact-form';
import AnimateOnScroll from '@/components/ui/animate-on-scroll';
import FoodPatternBackground from '@/components/ui/food-pattern-background';
import HoverCardEffect from '@/components/ui/hover-card-effect';

export default function HomePage() {
  // State for parallax effect
  const [scrollY, setScrollY] = useState(0);
  
  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch featured sellers
  const { data: sellers = [], isLoading, isError } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => foodApi.getSellers(),
    // Add retry and stale time options to improve error handling
    retry: 1,
    staleTime: 60000, // 1 minute
  });

  // Take only the first 4 sellers for the featured section
  const featuredSellers = sellers.slice(0, 5);

  // Food images for the floating food items
  const foodImages = [
    "https://res.cloudinary.com/dj5iihhqv/image/upload/v1622547337/homely/food/butter_chicken_lhsqbp.jpg",
    "https://res.cloudinary.com/dj5iihhqv/image/upload/v1622547337/homely/food/paneer_tikka_masala_wvmmbl.jpg",
    "https://res.cloudinary.com/dj5iihhqv/image/upload/v1622547337/homely/food/biryani_ckzgb2.jpg",
    "https://res.cloudinary.com/dj5iihhqv/image/upload/v1622547337/homely/food/dosa_vf8tkk.jpg",
  ];

  return (
    <MainLayout transitionType="fade">
      {/* Hero Section with Parallax Effect */}
      <section className="relative h-[85vh] overflow-hidden bg-gradient-to-r from-primary-dark/10 to-primary/5">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 bg-food-pattern opacity-5"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          aria-hidden="true"
        />
        
        {/* Floating Food Images */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {foodImages.map((src, index) => (
            <div 
              key={index}
              className={`absolute rounded-full overflow-hidden shadow-xl animate-float`}
              style={{
                width: `${80 + index * 10}px`,
                height: `${80 + index * 10}px`,
                left: `${10 + index * 20}%`,
                top: `${10 + index * 15}%`,
                animationDelay: `${index * 0.5}s`,
                zIndex: 1,
              }}
            >
              <Image
                src={src}
                alt="Floating food"
                fill
                sizes="100px"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 h-full flex flex-col md:flex-row items-center relative z-10">
          <AnimateOnScroll animation="fade-in-up" className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-spice bg-clip-text text-transparent">
              Delicious Home-Cooked Meals
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-lg">
              Support local home chefs and enjoy authentic, freshly prepared food from the comfort of your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary transition-all duration-300 shadow-glow"
                asChild
              >
                <Link href="/sellers">Order Now</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary hover:bg-primary/10 transition-all duration-300"
                asChild
              >
                <Link href="/register?userType=seller">Become a Seller</Link>
              </Button>
            </div>
          </AnimateOnScroll>
          
          <div className="md:w-1/2 relative">
            <AnimateOnScroll animation="fade-in" delay={300}>
              <div 
                className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl"
                style={{ transform: `translateY(${scrollY * -0.1}px)` }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Delicious home-cooked food"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                
                {/* Decorative elements */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-curry rounded-full opacity-30 blur-xl" />
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-spice rounded-full opacity-20 blur-xl" />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <FoodPatternBackground variant="light" className="py-20">
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-in-up">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-spice bg-clip-text text-transparent">
              How It Works
            </h2>
          </AnimateOnScroll>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Browse Sellers",
                description: "Explore a variety of home chefs in your area and their unique menus.",
                icon: "🍳",
                color: "bg-curry"
              },
              {
                step: 2,
                title: "Place Your Order",
                description: "Select your favorite dishes and place your order with just a few clicks.",
                icon: "📱",
                color: "bg-spice"
              },
              {
                step: 3,
                title: "Enjoy Your Meal",
                description: "Receive your freshly prepared meal delivered right to your doorstep.",
                icon: "🍽️",
                color: "bg-herb"
              }
            ].map((item, index) => (
              <AnimateOnScroll 
                key={index} 
                animation="fade-in-up" 
                delay={index * 200}
                className="flex flex-col items-center"
              >
                <div className={`${item.color} rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-glow-warm text-3xl animate-bounce-light`}>
                  <span>{item.icon}</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600 text-center">
                  {item.description}
                </p>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </FoodPatternBackground>

      {/* Featured Sellers Section */}
      <section className="py-20 bg-gradient-to-b from-white to-cream-light">
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-in-up">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-spice bg-clip-text text-transparent">
              Featured Sellers
            </h2>
          </AnimateOnScroll>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading sellers...</p>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-40">
              <p>Unable to load sellers. Please try again later.</p>
            </div>
          ) : featuredSellers.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>No sellers available at the moment. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredSellers.map((seller: Seller, index) => (
                  <AnimateOnScroll 
                    key={seller.id || index} 
                    animation="fade-in-up" 
                    delay={index * 100}
                  >
                    <HoverCardEffect glowColor="rgba(255, 107, 53, 0.2)">
                      <Link href={`/sellers/${seller._id}`} className="block">
                        <Card className="overflow-hidden h-full border-0 shadow-soft">
                          {/* Seller Image */}
                          <div className="relative h-48 w-full overflow-hidden">
                            <CloudinaryImage
                              src={getSellerImageUrl(seller.imageUrl || seller.image)}
                              alt={seller.name}
                              fill
                              className="object-cover transition-transform duration-500 hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${seller.status === 'open' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-white font-medium">{seller.status === 'open' ? 'Open' : 'Closed'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl">{seller.name}</CardTitle>
                            <CardDescription>{seller.address}</CardDescription>
                          </CardHeader>
                          
                          <CardContent className="pb-4">
                            {seller.rating && (
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="ml-1 text-sm">{seller.rating.toFixed(1)}</span>
                                <span className="ml-2 text-xs text-gray-500">({Math.floor(Math.random() * 100) + 20} reviews)</span>
                              </div>
                            )}
                          </CardContent>
                          
                          <CardFooter>
                            <Button 
                              asChild 
                              className="w-full bg-gradient-to-r from-spice to-tomato hover:from-tomato hover:to-spice transition-all duration-300"
                            >
                              <span>View Menu</span>
                            </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    </HoverCardEffect>
                  </AnimateOnScroll>
                ))}
              </div>
              
              <AnimateOnScroll animation="fade-in-up" delay={300} className="mt-12 text-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  className="border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <Link href="/sellers">View All Sellers</Link>
                </Button>
              </AnimateOnScroll>
            </>
          )}
        </div>
      </section>

      {/* Testimonials Section with Improved Design */}
      <FoodPatternBackground variant="warm" className="py-20">
        <div className="container mx-auto px-4">
          <AnimateOnScroll animation="fade-in-up">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-spice bg-clip-text text-transparent">
              What Our Customers Say
            </h2>
          </AnimateOnScroll>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "The food from Homely reminds me of my mother's cooking! The authentic flavors bring back childhood memories. The paneer butter masala was absolutely delicious.",
                name: "Rajesh Sharma",
                location: "Delhi",
                image: "https://randomuser.me/api/portraits/men/36.jpg"
              },
              {
                text: "As a working professional, Homely has been a lifesaver! The South Indian meals are perfectly spiced, and I love supporting local home chefs. Their dosa and sambhar are outstanding.",
                name: "Priya Patel",
                location: "Mumbai",
                image: "https://randomuser.me/api/portraits/women/33.jpg"
              },
              {
                text: "My family loves the variety of regional cuisines available on Homely. The Bengali fish curry was exceptional, and the biryani is consistently the best I've had in Bangalore!",
                name: "Vikram Iyer",
                location: "Bangalore",
                image: "https://randomuser.me/api/portraits/men/22.jpg"
              }
            ].map((testimonial, index) => (
              <AnimateOnScroll 
                key={index} 
                animation="fade-in-up" 
                delay={index * 200}
              >
                <HoverCardEffect intensity="subtle" glowColor="rgba(255, 193, 69, 0.3)">
                  <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-soft">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      
                      <p className="text-gray-700 mb-6 italic">
                        "{testimonial.text}"
                      </p>
                      
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full mr-4 overflow-hidden relative ring-2 ring-primary/20 ring-offset-2">
                          <Image 
                            src={testimonial.image} 
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-gray-500">{testimonial.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </HoverCardEffect>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </FoodPatternBackground>

      {/* Join Us Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <AnimateOnScroll animation="fade-in-up">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-spice bg-clip-text text-transparent">
                Join Our Community of Food Lovers
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Whether you're a food enthusiast or a talented home chef, Homely welcomes you to be part of our growing family.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary transition-all duration-300 shadow-glow"
                  asChild
                >
                  <Link href="/register">Sign Up as Customer</Link>
                </Button>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-spice to-curry hover:from-curry hover:to-spice transition-all duration-300 shadow-glow-warm"
                  asChild
                >
                  <Link href="/register?userType=seller">Become a Seller</Link>
                </Button>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <AnimateOnScroll animation="fade-in-left">
                <div>
                  <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-spice bg-clip-text text-transparent">
                    Get in Touch
                  </h2>
                  <p className="text-lg text-gray-700 mb-8">
                    Have questions about Homely? We're here to help! Fill out the form and our team will get back to you as soon as possible.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium">Email</h3>
                        <p className="text-gray-600">support@homely.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium">Phone</h3>
                        <p className="text-gray-600">+91 98765 43210</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium">Address</h3>
                        <p className="text-gray-600">123 Food Street, Flavor Town, India</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll animation="fade-in-right" delay={200}>
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <ContactForm />
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

