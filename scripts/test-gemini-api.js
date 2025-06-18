/**
 * Test script to verify Gemini API functionality
 * Run with: node scripts/test-gemini-api.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash'; // Updated to use the requested model

if (!GEMINI_API_KEY) {
  console.error('Missing Gemini API key in environment variables');
  process.exit(1);
}

console.log('API Key found:', GEMINI_API_KEY.substring(0, 5) + '...' + GEMINI_API_KEY.slice(-4));
console.log('Testing Gemini API with model:', GEMINI_MODEL);

async function testGeminiAPI() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate nutritional information for Butter Chicken in JSON format.
                     Include calories, protein, carbs, fat, fiber, sugar, and sodium content.`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
          }
        })
      }
    );

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', JSON.stringify(errorData, null, 2));
      return;
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    // Extract the response text
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('\nGenerated Text:', responseText);
    
  } catch (error) {
    console.error('Error testing Gemini API:', error);
  }
}

testGeminiAPI(); 