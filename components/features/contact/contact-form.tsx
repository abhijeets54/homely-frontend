'use client';

import { useForm, ValidationError } from '@formspree/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';

export default function ContactForm() {
  const [state, handleSubmit] = useForm('mvgrqpgz');

  if (state.succeeded) {
    return (
      <Card className="p-6 bg-green-50">
        <div className="text-center">
          <Icons.check className="mx-auto h-10 w-10 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p>Your message has been sent successfully. We'll get back to you soon.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            required
          />
          <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-500 text-xs mt-1" />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            required
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-xs mt-1" />
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1">
            Subject
          </label>
          <Input
            id="subject"
            name="subject"
            type="text"
            placeholder="What is this regarding?"
            required
          />
          <ValidationError prefix="Subject" field="subject" errors={state.errors} className="text-red-500 text-xs mt-1" />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <Textarea
            id="message"
            name="message"
            placeholder="How can we help you?"
            className="min-h-[120px]"
            required
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-500 text-xs mt-1" />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={state.submitting}
        >
          {state.submitting ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
        <ValidationError errors={state.errors} className="text-red-500 text-xs mt-1" />
      </form>
    </Card>
  );
} 