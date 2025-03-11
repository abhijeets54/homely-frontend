'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ApiTestPage() {
  const [url, setUrl] = useState<string>(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`);
  const [method, setMethod] = useState<string>('POST');
  const [headers, setHeaders] = useState<string>('{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}');
  const [body, setBody] = useState<string>('{\n  "email": "customer@test.com",\n  "password": "password123",\n  "role": "customer"\n}');
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse('');
    setError('');

    try {
      // Parse headers and body
      const parsedHeaders = JSON.parse(headers);
      const parsedBody = method === 'GET' || method === 'HEAD' ? undefined : JSON.parse(body);

      console.log('Sending request to:', url);
      console.log('Method:', method);
      console.log('Headers:', parsedHeaders);
      console.log('Body:', parsedBody);

      // Prepare request options
      const options: RequestInit = {
        method,
        headers: parsedHeaders,
        credentials: 'include',
        mode: 'cors',
      };

      // Add body for non-GET requests
      if (parsedBody && method !== 'GET' && method !== 'HEAD') {
        options.body = JSON.stringify(parsedBody);
      }

      // Send the request
      console.log('Fetch options:', options);
      const response = await fetch(url, options);
      
      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Try to parse response as JSON
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Format the response
      const formattedResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData
      };

      setResponse(JSON.stringify(formattedResponse, null, 2));
    } catch (err) {
      console.error('API test error:', err);
      
      // Enhanced error handling
      let errorMessage = '';
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage = `Network error: Failed to fetch. This could be due to:
1. The backend server is not running at ${url}
2. CORS is not properly configured on the backend
3. Network connectivity issues

Try the following:
- Check if your backend server is running
- Visit the CORS test page at /cors-test
- Ensure your backend has proper CORS configuration`;
      } else {
        errorMessage = `Error: ${err instanceof Error ? err.message : String(err)}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">API Test Tool</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
          <label className="block mb-2 font-medium">URL</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter API URL"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Method</label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="OPTIONS">OPTIONS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block mb-2 font-medium">Headers (JSON)</label>
          <Textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder="Enter request headers as JSON"
            className="font-mono text-sm h-40"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Body (JSON)</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter request body as JSON"
            className="font-mono text-sm h-40"
            disabled={method === 'GET' || method === 'HEAD'}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <Button onClick={handleSendRequest} disabled={loading}>
          {loading ? 'Sending...' : 'Send Request'}
        </Button>
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
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Common API Endpoints to Test:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><code className="bg-gray-100 px-1 rounded">/api/auth/login</code> - Login endpoint (POST)</li>
          <li><code className="bg-gray-100 px-1 rounded">/api/auth/register/customer</code> - Register customer endpoint (POST)</li>
          <li><code className="bg-gray-100 px-1 rounded">/api/auth/register/seller</code> - Register seller endpoint (POST)</li>
          <li><code className="bg-gray-100 px-1 rounded">/api/auth/me</code> - Get current user (GET, requires token)</li>
        </ul>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Troubleshooting CORS Issues:</h3>
        <p className="mb-2">If you're seeing CORS errors, try the following:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Visit the <a href="/cors-test" className="text-blue-600 hover:underline">CORS Test Page</a> to diagnose CORS issues</li>
          <li>Ensure your backend server has proper CORS configuration</li>
          <li>For requests with credentials, the backend must specify an exact origin (not '*')</li>
          <li>Check that the backend allows the necessary HTTP methods and headers</li>
        </ul>
      </div>
    </div>
  );
} 