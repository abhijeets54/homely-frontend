import React from 'react';
import { MainLayout } from '@/components/layouts';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'About Us | Homely',
  description: 'Learn more about Homely - connecting you with delicious home-cooked meals from local chefs',
};

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">About Homely</h1>
        
        <div className="max-w-3xl mx-auto space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700">
              At Homely, we're on a mission to connect food lovers with talented home chefs in their community. 
              We believe that everyone deserves access to delicious, authentic, home-cooked meals, even when they 
              don't have the time or energy to cook themselves.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-700">
              Homely was founded in 2023 by a group of food enthusiasts who recognized a gap in the food delivery market. 
              While there were plenty of options for restaurant delivery, there was no easy way to access authentic 
              home-cooked meals made by talented home chefs in the community.
            </p>
            <p className="text-gray-700 mt-4">
              We started in a small neighborhood in Bangalore, connecting just a handful of home chefs with their neighbors. 
              The response was overwhelming - people loved having access to homemade food, and home chefs loved being able 
              to share their passion and earn income from their culinary skills.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium">For Customers</h3>
                <p className="text-gray-700">
                  Browse through a variety of home chefs in your area, explore their menus, and order delicious 
                  home-cooked meals with just a few clicks. Track your order in real-time and enjoy a warm, 
                  homemade meal delivered right to your doorstep.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium">For Home Chefs</h3>
                <p className="text-gray-700">
                  Share your culinary passion with your community. Set your own menu, prices, and availability. 
                  Receive orders, prepare meals in your own kitchen, and let our delivery partners handle the rest.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium">For Delivery Partners</h3>
                <p className="text-gray-700">
                  Join our network of delivery partners to earn flexible income. Choose your own hours and deliver 
                  delicious meals within your community.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Community:</strong> We believe in the power of food to bring people together.</li>
              <li><strong>Authenticity:</strong> We celebrate diverse culinary traditions and authentic recipes.</li>
              <li><strong>Empowerment:</strong> We provide opportunities for home chefs to share their skills and earn income.</li>
              <li><strong>Quality:</strong> We maintain high standards for food safety, quality, and service.</li>
              <li><strong>Sustainability:</strong> We work to reduce food waste and environmental impact.</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
            <p className="text-gray-700">
              Whether you're a food lover looking for authentic home-cooked meals, a talented home chef wanting to 
              share your culinary creations, or someone looking for flexible earning opportunities, we welcome you 
              to join the Homely community.
            </p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 