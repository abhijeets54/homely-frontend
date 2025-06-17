import React from 'react';
import { MainLayout } from '@/components/layouts';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Terms of Service | Homely',
  description: 'Terms and conditions for using the Homely platform',
};

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Terms of Service</h1>
        
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 mb-6">
            <p className="text-sm text-gray-500 mb-4">Last Updated: June 15, 2025</p>
            
            <p className="text-gray-700 mb-4">
              Welcome to Homely. Please read these Terms of Service ("Terms") carefully as they contain important 
              information about your legal rights, remedies, and obligations. By accessing or using the Homely platform, 
              you agree to comply with and be bound by these Terms.
            </p>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing or using the Homely platform, mobile application, or any services provided by Homely 
                (collectively, the "Services"), you agree to be bound by these Terms. If you do not agree to these Terms, 
                you may not access or use the Services.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">2. Definitions</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>"Homely"</strong> refers to the Homely platform, its owners, operators, and affiliates.</p>
                <p><strong>"User"</strong> refers to any individual or entity that accesses or uses the Services, including Customers, Sellers, and Delivery Partners.</p>
                <p><strong>"Customer"</strong> refers to a User who orders food through the Services.</p>
                <p><strong>"Seller"</strong> refers to a User who offers and sells food through the Services.</p>
                <p><strong>"Delivery Partner"</strong> refers to a User who provides delivery services through the Services.</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <div className="space-y-2 text-gray-700">
                <p>3.1. To access certain features of the Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
                <p>3.2. You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify Homely immediately of any unauthorized use of your account.</p>
                <p>3.3. Homely reserves the right to suspend or terminate your account if any information provided during the registration process or thereafter proves to be inaccurate, not current, or incomplete.</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">4. User Conduct</h2>
              <div className="space-y-2 text-gray-700">
                <p>4.1. You agree not to use the Services for any illegal or unauthorized purpose.</p>
                <p>4.2. You agree not to violate any laws in your jurisdiction (including but not limited to copyright laws).</p>
                <p>4.3. You agree not to post or transmit any content that is unlawful, threatening, abusive, harassing, defamatory, libelous, deceptive, fraudulent, invasive of another's privacy, or offensive.</p>
                <p>4.4. You agree not to attempt to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Services.</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">5. Food Safety and Quality</h2>
              <div className="space-y-2 text-gray-700">
                <p>5.1. Sellers are responsible for ensuring that all food items offered through the Services comply with applicable food safety regulations.</p>
                <p>5.2. Homely does not guarantee the quality, safety, or legality of items offered by Sellers.</p>
                <p>5.3. Customers with allergies or dietary restrictions should contact Sellers directly for information about ingredients and preparation methods.</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">6. Payment and Fees</h2>
              <div className="space-y-2 text-gray-700">
                <p>6.1. Customers agree to pay all applicable fees for orders placed through the Services.</p>
                <p>6.2. Homely may charge service fees for the use of the Services. All fees are non-refundable unless otherwise specified.</p>
                <p>6.3. Homely uses third-party payment processors to process payments. By using the Services, you agree to the terms and conditions of these third-party payment processors.</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <div className="space-y-2 text-gray-700">
                <p>7.1. To the maximum extent permitted by law, Homely shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.</p>
                <p>7.2. Homely's total liability arising out of or relating to these Terms shall not exceed the greater of one hundred dollars ($100) or the amount you have paid to Homely in the past six months.</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
              <p className="text-gray-700">
                Homely reserves the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on the Services and updating the "Last Updated" date. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">9. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms, please contact us at legal@homely.in.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 