'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<string>('Checking connection...');
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const checkConnection = async () => {
    setStatus('Checking connection...');
    setResponse('');
    setError('');
    
    try {
      // First, try a simple fetch to the root endpoint
      const rootResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const rootText = await rootResponse.text();
      setResponse(`Root endpoint response: ${rootText}`);
      
      // Then try the login endpoint with a preflight OPTIONS request
      const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      setStatus(`Connection successful! Status: ${loginResponse.status}`);
      
      // Check CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': loginResponse.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': loginResponse.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': loginResponse.headers.get('Access-Control-Allow-Headers'),
      };
      
      setResponse(prev => `${prev}\n\nCORS Headers: ${JSON.stringify(corsHeaders, null, 2)}`);
      
    } catch (err) {
      setStatus('Connection failed');
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Connection test error:', err);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Backend Connection Test</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h2 className="font-semibold text-xl mb-4">Connection Status</h2>
        <p className={`font-medium ${status.includes('successful') ? 'text-green-600' : status.includes('failed') ? 'text-red-600' : 'text-blue-600'}`}>
          {status}
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 p-6 rounded-lg mb-6">
          <h2 className="font-semibold text-xl mb-4">Error</h2>
          <pre className="bg-white p-4 rounded overflow-auto text-sm text-red-600">
            {error}
          </pre>
        </div>
      )}
      
      {response && (
        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <h2 className="font-semibold text-xl mb-4">Response</h2>
          <pre className="bg-white p-4 rounded overflow-auto text-sm">
            {response}
          </pre>
        </div>
      )}
      
      <div className="flex space-x-4">
        <Button onClick={checkConnection}>
          Test Connection Again
        </Button>
        
        <Button variant="outline" onClick={() => window.location.href = '/test-login'}>
          Go to Test Login
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Connection Troubleshooting Tips:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure your backend server is running on <code className="bg-gray-100 px-1 rounded">{apiUrl}</code></li>
          <li>Check if CORS is properly configured on your backend</li>
          <li>Verify that the API endpoints match between frontend and backend</li>
          <li>Check if there are any network issues or firewall restrictions</li>
          <li>Try accessing the API directly in your browser to see if it responds</li>
        </ul>
      </div>
    </div>
  );
} 