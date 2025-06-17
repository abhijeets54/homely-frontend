import React from 'react';
import { MainLayout } from '@/components/layouts';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Privacy Policy | Homely',
  description: 'Privacy policy for Homely - how we collect, use, and protect your data',
};

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
        
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 mb-6">
            <p className="text-sm text-gray-500 mb-4">Last Updated: June 15, 2025</p>
            
            <p className="text-gray-700 mb-4">
              This privacy notice for Homely ("Company," "we," "us," or "our"), describes how and why we might collect, 
              store, use, and/or share ("process") your information when you use our services ("Services"), such as when you:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>Visit our website at homely.in, or any website of ours that links to this privacy notice</li>
              <li>Download and use our mobile application (Homely)</li>
              <li>Engage with us in other related ways, including any sales, marketing, or events</li>
            </ul>
            <p className="text-gray-700">
              Reading this privacy notice will help you understand your privacy rights and choices. 
              If you do not agree with our policies and practices, please do not use our Services. 
              If you still have any questions or concerns, please contact us at privacy@homely.in.
            </p>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">1. INFORMATION WE COLLECT</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-medium">Personal information you disclose to us</h3>
                  <p className="mt-2">
                    We collect personal information that you voluntarily provide to us when you register on the Services, 
                    express an interest in obtaining information about us or our products and Services, when you participate 
                    in activities on the Services, or otherwise when you contact us.
                  </p>
                  <p className="mt-2">
                    <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on 
                    the context of your interactions with us and the Services, the choices you make, and the products and features 
                    you use. The personal information we collect may include the following:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Names</li>
                    <li>Phone numbers</li>
                    <li>Email addresses</li>
                    <li>Mailing addresses</li>
                    <li>Usernames</li>
                    <li>Passwords</li>
                    <li>Contact preferences</li>
                    <li>Contact or authentication data</li>
                    <li>Billing addresses</li>
                    <li>Debit/credit card numbers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium">Sensitive Information</h3>
                  <p className="mt-2">
                    We do not process sensitive information.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Payment Data</h3>
                  <p className="mt-2">
                    We may collect data necessary to process your payment if you make purchases, such as your 
                    payment instrument number (such as a credit card number), and the security code associated with 
                    your payment instrument. All payment data is stored by our payment processors, and you should 
                    review their privacy policies and contact them directly for responses to your questions.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Information automatically collected</h3>
                  <p className="mt-2">
                    We automatically collect certain information when you visit, use, or navigate the Services. 
                    This information does not reveal your specific identity (like your name or contact information) 
                    but may include device and usage information, such as your IP address, browser and device 
                    characteristics, operating system, language preferences, referring URLs, device name, country, 
                    location, information about how and when you use our Services, and other technical information. 
                    This information is primarily needed to maintain the security and operation of our Services, 
                    and for our internal analytics and reporting purposes.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">2. HOW WE USE YOUR INFORMATION</h2>
              <p className="text-gray-700">
                We process your information for purposes based on legitimate business interests, the fulfillment 
                of our contract with you, compliance with our legal obligations, and/or your consent.
              </p>
              <p className="text-gray-700 mt-3">
                We use personal information collected via our Services for a variety of business purposes 
                described below. We process your personal information for these purposes in reliance on our legitimate 
                business interests, in order to enter into or perform a contract with you, with your consent, and/or 
                for compliance with our legal obligations. We indicate the specific processing grounds we rely on 
                next to each purpose listed below.
              </p>
              <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                <li>To facilitate account creation and authentication and otherwise manage user accounts</li>
                <li>To deliver and facilitate delivery of services to the user</li>
                <li>To respond to user inquiries/offer support to users</li>
                <li>To send administrative information to you</li>
                <li>To send you marketing and promotional communications</li>
                <li>To deliver targeted advertising to you</li>
                <li>To protect our Services</li>
                <li>To comply with legal obligations</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">3. WILL YOUR INFORMATION BE SHARED WITH ANYONE?</h2>
              <p className="text-gray-700">
                We only share information with your consent, to comply with laws, to provide you with services, 
                to protect your rights, or to fulfill business obligations.
              </p>
              <p className="text-gray-700 mt-3">
                We may process or share your data that we hold based on the following legal basis:
              </p>
              <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                <li><strong>Consent:</strong> We may process your data if you have given us specific consent to use your personal information for a specific purpose.</li>
                <li><strong>Legitimate Interests:</strong> We may process your data when it is reasonably necessary to achieve our legitimate business interests.</li>
                <li><strong>Performance of a Contract:</strong> Where we have entered into a contract with you, we may process your personal information to fulfill the terms of our contract.</li>
                <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process, such as in response to a court order or a subpoena.</li>
                <li><strong>Vital Interests:</strong> We may disclose your information where we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, situations involving potential threats to the safety of any person and illegal activities, or as evidence in litigation in which we are involved.</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
              <p className="text-gray-700">
                We may use cookies and other tracking technologies to collect and store your information.
              </p>
              <p className="text-gray-700 mt-3">
                We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. 
                Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">5. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
              <p className="text-gray-700">
                We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.
              </p>
              <p className="text-gray-700 mt-3">
                We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, 
                unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
              </p>
              <p className="text-gray-700 mt-3">
                When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, 
                or, if this is not possible (for example, because your personal information has been stored in backup archives), 
                then we will securely store your personal information and isolate it from any further processing until deletion is possible.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">6. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
              <p className="text-gray-700">
                We aim to protect your personal information through a system of organizational and technical security measures.
              </p>
              <p className="text-gray-700 mt-3">
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal 
                information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over 
                the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, 
                cybercriminals, or other unauthorized third parties will not be able to defeat our security, and improperly collect, access, steal, 
                or modify your information. Although we will do our best to protect your personal information, transmission of personal information 
                to and from our Services is at your own risk. You should only access the Services within a secure environment.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">7. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
              <p className="text-gray-700">
                In some regions, such as the European Economic Area (EEA) and United Kingdom (UK), you have rights that allow you greater access to 
                and control over your personal information. You may review, change, or terminate your account at any time.
              </p>
              <p className="text-gray-700 mt-3">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                <li>The right to access, update or delete the information we have on you</li>
                <li>The right of rectification</li>
                <li>The right to object</li>
                <li>The right of restriction</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">8. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
              <p className="text-gray-700">
                Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting 
                you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. 
                At this stage no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not 
                currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. 
                If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised 
                version of this privacy notice.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">9. UPDATES TO THIS NOTICE</h2>
              <p className="text-gray-700">
                We will update this notice as necessary to stay compliant with relevant laws.
              </p>
              <p className="text-gray-700 mt-3">
                We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the 
                updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify 
                you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review 
                this privacy notice frequently to be informed of how we are protecting your information.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">10. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
              <p className="text-gray-700">
                If you have questions or comments about this notice, you may email us at privacy@homely.in or contact us by post at:
              </p>
              <p className="text-gray-700 mt-3">
                Homely<br />
                42, Koramangala 5th Block<br />
                Bangalore, Karnataka 560034<br />
                India
              </p>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 