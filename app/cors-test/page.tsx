'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function CorsTestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const testCorsWithCredentials = async () => {
    setLoading(true);
    setResult('Testing CORS with credentials...');
    
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'OPTIONS',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      setResult(`CORS preflight test result: ${response.status} ${response.statusText}`);
    } catch (error) {
      setResult(`CORS test failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testCorsWithoutCredentials = async () => {
    setLoading(true);
    setResult('Testing CORS without credentials...');
    
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'OPTIONS',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      setResult(`CORS preflight test result: ${response.status} ${response.statusText}`);
    } catch (error) {
      setResult(`CORS test failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">CORS Test Tool</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button onClick={testCorsWithCredentials} disabled={loading}>
          Test CORS with credentials
        </Button>
        
        <Button onClick={testCorsWithoutCredentials} disabled={loading}>
          Test CORS without credentials
        </Button>
      </div>
      
      {result && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="font-semibold text-xl mb-4">Test Result</h2>
          <pre className="bg-white p-4 rounded overflow-auto text-sm">
            {result}
          </pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">CORS Issue Solution:</h3>
        <p className="mb-4">The error occurs because you're using <code>credentials: 'include'</code> with a wildcard CORS origin.</p>
        
        <h4 className="font-semibold mt-4">Backend Fix (Express.js):</h4>
        <pre className="bg-white p-4 rounded overflow-auto text-sm mb-4">
{`// In your Express.js backend server.js or app.js
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));`}
        </pre>
        
        <h4 className="font-semibold mt-4">Frontend Fix:</h4>
        <p>Make sure all fetch requests include:</p>
        <pre className="bg-white p-4 rounded overflow-auto text-sm">
{`fetch(url, {
  // ... other options
  credentials: 'include',
  mode: 'cors'
})`}
        </pre>
      </div>
    </div>
  );
} 