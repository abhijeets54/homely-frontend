/**
 * Nutrition API utility for analyzing food nutrition using Google's Gemini API
 */

// API key is set via environment variable
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface NutritionInfo {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
  additionalInfo?: string;
}

export interface FoodNutritionRequest {
  dishName: string;
  restaurantName: string;
  description?: string;
}

/**
 * Analyzes the nutritional content of a food item using Gemini AI
 */
export async function analyzeFoodNutrition(
  request: FoodNutritionRequest
): Promise<NutritionInfo> {
  try {
    if (!GEMINI_API_KEY) {
      console.error('Missing Gemini API key - using provided key: AIzaSyBBEQRrU436_vWNxNH4wyz9ZPZzzKPfBkI');
      // Fallback to hardcoded key if environment variable isn't working
      return analyzeFoodNutritionWithKey(request, 'AIzaSyBBEQRrU436_vWNxNH4wyz9ZPZzzKPfBkI');
    }

    return analyzeFoodNutritionWithKey(request, GEMINI_API_KEY);
  } catch (error) {
    console.error('Error analyzing nutrition:', error);
    return getPlaceholderNutritionInfo();
  }
}

/**
 * Implementation of nutrition analysis with explicit API key
 */
async function analyzeFoodNutritionWithKey(
  request: FoodNutritionRequest,
  apiKey: string
): Promise<NutritionInfo> {
  try {
    console.log(`Analyzing nutrition for ${request.dishName} from ${request.restaurantName}`);
    
    const prompt = `
      Generate detailed nutritional information for the dish "${request.dishName}" 
      from ${request.restaurantName}.
      ${request.description ? `Description: ${request.description}` : ''}
      
      Include calories, protein, carbs, fat, fiber, sugar, and sodium content.
      Format the response as a JSON object with the following keys:
      {
        "calories": "value in kcal",
        "protein": "value in g",
        "carbs": "value in g",
        "fat": "value in g",
        "fiber": "value in g",
        "sugar": "value in g",
        "sodium": "value in mg",
        "additionalInfo": "any additional nutritional insights about this dish"
      }
      
      Only return the JSON object with no other text.
    `;

    console.log('Sending request to Gemini API...');
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
        }
      })
    });

    console.log(`Gemini API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from Gemini API');
    
    // Extract the response text from the Gemini API response
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      console.error('No text in Gemini response:', data);
      throw new Error('Invalid response from Gemini API');
    }
    
    console.log('Parsing nutrition data from response');
    
    // Try to parse the JSON response
    try {
      // Find and extract the JSON object from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error('No JSON found in response:', responseText);
        throw new Error('No JSON found in response');
      }
      
      const nutritionData = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed nutrition data:', nutritionData);
      
      // Validate and structure the response
      return {
        calories: nutritionData.calories || 'N/A',
        protein: nutritionData.protein || 'N/A',
        carbs: nutritionData.carbs || 'N/A',
        fat: nutritionData.fat || 'N/A',
        fiber: nutritionData.fiber || 'N/A',
        sugar: nutritionData.sugar || 'N/A',
        sodium: nutritionData.sodium || 'N/A',
        additionalInfo: nutritionData.additionalInfo || undefined
      };
    } catch (parseError) {
      console.error('Error parsing nutrition data:', parseError);
      console.error('Raw response:', responseText);
      
      // Attempt a more forgiving extraction if JSON parsing fails
      try {
        // Try to extract key-value pairs directly from text
        const extractValue = (key: string): string => {
          const regex = new RegExp(`["']?${key}["']?\\s*:\\s*["']([^"']+)["']`, 'i');
          const match = responseText.match(regex);
          return match ? match[1] : 'N/A';
        };
        
        return {
          calories: extractValue('calories'),
          protein: extractValue('protein'),
          carbs: extractValue('carbs'),
          fat: extractValue('fat'),
          fiber: extractValue('fiber'),
          sugar: extractValue('sugar'),
          sodium: extractValue('sodium'),
          additionalInfo: 'Data extracted from partial results.'
        };
      } catch (backupError) {
        console.error('Backup extraction failed:', backupError);
        return getPlaceholderNutritionInfo();
      }
    }
  } catch (error) {
    console.error('Error in analyzeFoodNutritionWithKey:', error);
    return getPlaceholderNutritionInfo();
  }
}

/**
 * Returns placeholder nutrition info when the API fails
 */
function getPlaceholderNutritionInfo(): NutritionInfo {
  return {
    calories: 'N/A',
    protein: 'N/A',
    carbs: 'N/A',
    fat: 'N/A',
    fiber: 'N/A',
    sugar: 'N/A',
    sodium: 'N/A',
    additionalInfo: 'Unable to retrieve nutritional information at this time.'
  };
}

/**
 * For development/testing without API calls
 */
export function getMockNutritionInfo(dishName: string): NutritionInfo {
  // Generate consistent but random-looking values based on the dish name
  const seed = Array.from(dishName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    const rand = x - Math.floor(x);
    return Math.floor(rand * (max - min + 1)) + min;
  };
  
  return {
    calories: `${random(200, 600)} kcal`,
    protein: `${random(5, 25)}g`,
    carbs: `${random(10, 40)}g`,
    fat: `${random(5, 20)}g`,
    fiber: `${random(1, 6)}g`,
    sugar: `${random(1, 12)}g`,
    sodium: `${random(100, 600)}mg`,
    additionalInfo: `This analysis is an estimate based on typical recipes for ${dishName}. Actual nutritional content may vary based on specific ingredients and preparation methods.`
  };
} 