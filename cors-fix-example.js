/**
 * CORS Configuration Example for Express.js Backend
 * 
 * This file shows how to properly configure CORS in an Express.js backend
 * to work with a frontend that sends credentials.
 * 
 * Instructions:
 * 1. Copy this code to your backend server.js or app.js file
 * 2. Install cors package if not already installed: npm install cors
 * 3. Restart your backend server
 */

const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration for credentials support
const corsOptions = {
  // Replace with your frontend URL (no trailing slash)
  origin: 'http://localhost:3000',
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  
  // How long the results of a preflight request can be cached
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// For specific routes, you can also apply CORS like this:
// app.options('/api/auth/login', cors(corsOptions)); // Enable preflight for login
// app.post('/api/auth/login', cors(corsOptions), (req, res) => { /* handler */ });

/**
 * IMPORTANT: When using credentials, you CANNOT use a wildcard origin '*'
 * 
 * INCORRECT:
 * app.use(cors({
 *   origin: '*',           // This won't work with credentials: true
 *   credentials: true
 * }));
 * 
 * CORRECT:
 * app.use(cors({
 *   origin: 'http://localhost:3000',  // Specific origin
 *   credentials: true
 * }));
 * 
 * For multiple origins:
 * app.use(cors({
 *   origin: function(origin, callback) {
 *     const allowedOrigins = ['http://localhost:3000', 'https://your-production-domain.com'];
 *     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
 *       callback(null, true);
 *     } else {
 *       callback(new Error('Not allowed by CORS'));
 *     }
 *   },
 *   credentials: true
 * }));
 */

// Rest of your Express.js app code... 