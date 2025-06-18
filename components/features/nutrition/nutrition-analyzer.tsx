'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { foodApi } from '@/lib/api/food';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Seller, FoodItem } from '@/lib/types/models';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  analyzeFoodNutrition, 
  getMockNutritionInfo, 
  NutritionInfo 
} from '@/lib/api/nutrition';

interface FollowUpQuestion {
  question: string;
  answer: string;
  loading: boolean;
}

export function NutritionAnalyzer() {
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpQuestion[]>([]);
  const [activeTab, setActiveTab] = useState('nutrition');
  const [usingRealApi, setUsingRealApi] = useState(false);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100 
      }
    }
  };

  // Fetch restaurants (sellers)
  const { 
    data: sellers = [], 
    isLoading: isLoadingSellers 
  } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => foodApi.getSellers(),
    staleTime: 300000, // 5 minutes
  });

  // Fetch menu items when a restaurant is selected
  const { 
    data: foodItems = [],
    isLoading: isLoadingFoodItems,
    refetch: refetchFoodItems
  } = useQuery({
    queryKey: ['foodItems', selectedSellerId],
    queryFn: () => foodApi.getFoodItemsBySeller(selectedSellerId),
    enabled: !!selectedSellerId,
    staleTime: 300000, // 5 minutes
  });

  // Check if API key exists on component mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      console.log("Gemini API key is configured");
      setUsingRealApi(true);
    } else {
      console.warn("No Gemini API key found, will use mock data");
      setUsingRealApi(false);
    }
  }, []);

  // Reset food selection when seller changes
  useEffect(() => {
    setSelectedFoodId('');
  }, [selectedSellerId]);

  // When seller changes, refetch food items
  useEffect(() => {
    if (selectedSellerId) {
      refetchFoodItems();
    }
  }, [selectedSellerId, refetchFoodItems]);

  const handleSellerChange = (sellerId: string) => {
    setSelectedSellerId(sellerId);
  };

  const handleFoodItemChange = (foodId: string) => {
    setSelectedFoodId(foodId);
  };

  const checkNutrition = async () => {
    if (!selectedFoodId) return;
    
    setIsAnalyzing(true);
    setDialogOpen(true);
    setFollowUpHistory([]);
    setActiveTab('nutrition');
    
    try {
      // Find the selected food item and seller for context
      const foodItem = foodItems.find(item => item.id === selectedFoodId || item._id === selectedFoodId);
      const seller = sellers.find(s => s.id === selectedSellerId || s._id === selectedSellerId);
      
      if (!foodItem || !seller) {
        throw new Error('Food item or seller not found');
      }

      console.log('API Key available:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      console.log('Using Gemini API to analyze nutrition for:', foodItem.name);

      // Always try to use the real API first
      try {
        const nutritionData = await analyzeFoodNutrition({
          dishName: foodItem.name,
          restaurantName: seller.name,
          description: foodItem.description
        });
        
        // Check if we got real data or a placeholder
        if (nutritionData.calories !== 'N/A') {
          setNutritionInfo(nutritionData);
          return;
        }
      } catch (apiError) {
        console.error('Error calling Gemini API:', apiError);
        // If real API fails, we'll fall back to mock data
      }
      
      // Fallback to mock data
      console.log('Using mock nutrition data as fallback');
      const mockData = getMockNutritionInfo(foodItem.name);
      setNutritionInfo(mockData);
      
    } catch (error) {
      console.error('Error analyzing nutrition:', error);
      setNutritionInfo({
        calories: 'N/A',
        protein: 'N/A',
        carbs: 'N/A',
        fat: 'N/A',
        fiber: 'N/A',
        sugar: 'N/A',
        sodium: 'N/A',
        additionalInfo: 'An error occurred while analyzing the nutritional information.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!followUpQuestion.trim() || !selectedFoodId) return;
    
    const newQuestion: FollowUpQuestion = {
      question: followUpQuestion,
      answer: '',
      loading: true
    };
    
    // Add the new question to history immediately
    setFollowUpHistory(prev => [...prev, newQuestion]);
    setFollowUpQuestion('');
    setActiveTab('questions');
    
    const foodItem = foodItems.find(item => item.id === selectedFoodId || item._id === selectedFoodId);
    const seller = sellers.find(s => s.id === selectedSellerId || s._id === selectedSellerId);
    
    if (!foodItem || !seller) return;
    
    try {
      // Actually call the Gemini API directly for follow-up questions
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (apiKey) {
        try {
          // Set up the API request to Gemini
          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `
                    About dish: ${foodItem.name} from restaurant ${seller.name}
                    Description: ${foodItem.description || 'No description available'}
                    Nutritional info: 
                    - Calories: ${nutritionInfo?.calories || 'Unknown'}
                    - Protein: ${nutritionInfo?.protein || 'Unknown'}
                    - Carbs: ${nutritionInfo?.carbs || 'Unknown'}
                    - Fat: ${nutritionInfo?.fat || 'Unknown'}
                    
                    User question: ${newQuestion.question}
                    
                    Provide a helpful, accurate, and concise answer about this dish based on the information provided.
                    Focus specifically on answering the question asked, and if you don't have specific information about this dish,
                    acknowledge that and provide general information that might be helpful.
                    Keep your answer under 150 words.
                  `
                }]
              }],
              generationConfig: {
                temperature: 0.2,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 200
              }
            })
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Update the question in history with the API response
          setFollowUpHistory(prev => 
            prev.map((item, idx) => 
              idx === prev.length - 1 
                ? { ...item, answer: generatedText.trim(), loading: false } 
                : item
            )
          );
          return;
        } catch (apiError) {
          console.error('Error calling Gemini API for follow-up:', apiError);
          // Fall through to the mock data response
        }
      }
      
      // If API call failed or no API key, use mock answers
      setTimeout(() => {
        let answer = '';
        const question = newQuestion.question.toLowerCase();
        
        if (question.includes('calorie') || question.includes('calories')) {
          answer = `${foodItem.name} contains approximately ${nutritionInfo?.calories || '300-400 calories'} per serving. This can vary based on the exact recipe and portion size.`;
        } else if (question.includes('protein')) {
          answer = `${foodItem.name} provides approximately ${nutritionInfo?.protein || '15-25g of protein'} per serving, making it a good protein source.`;
        } else if (question.includes('carb') || question.includes('carbohydrate')) {
          answer = `${foodItem.name} contains approximately ${nutritionInfo?.carbs || '20-30g of carbs'} per serving. The carbohydrate content mainly comes from the ingredients like rice, flour, or vegetables in the dish.`;
        } else if (question.includes('fat')) {
          answer = `The fat content in ${foodItem.name} is approximately ${nutritionInfo?.fat || '10-18g'} per serving. This includes both saturated and unsaturated fats, with the exact ratio depending on the cooking methods and ingredients used.`;
        } else if (question.includes('ingredient') || question.includes('made')) {
          answer = `${foodItem.name} typically contains ${foodItem.description || 'various ingredients based on the restaurant\'s specific recipe'}. For the exact ingredients list, I recommend checking with ${seller.name} directly.`;
        } else if (question.includes('healthy') || question.includes('nutrition')) {
          answer = `${foodItem.name} provides a mix of macronutrients including protein (${nutritionInfo?.protein || '~20g'}), carbs (${nutritionInfo?.carbs || '~25g'}), and fats (${nutritionInfo?.fat || '~15g'}). To make it healthier, you could request less oil or butter in the preparation, or pair it with a vegetable side dish for added fiber and micronutrients.`;
        } else if (question.includes('allergen') || question.includes('allergic')) {
          answer = `Common allergens that might be present in ${foodItem.name} include dairy, nuts, gluten, or shellfish depending on the recipe. For specific allergen information, please ask ${seller.name} directly as recipes can vary.`;
        } else if (question.includes('dietary') || question.includes('vegan') || question.includes('vegetarian')) {
          answer = `You should check with ${seller.name} whether ${foodItem.name} meets specific dietary requirements like being vegetarian, vegan, gluten-free, etc. Many restaurants can modify dishes to accommodate dietary needs upon request.`;
        } else {
          answer = `Thank you for your question about ${foodItem.name}. To provide a more accurate answer about this specific dish as prepared by ${seller.name}, I'd recommend checking with the restaurant directly. They can provide the most up-to-date and accurate information about their preparation methods and ingredients.`;
        }
        
        // Update the question in history with the mock answer
        setFollowUpHistory(prev => 
          prev.map((item, idx) => 
            idx === prev.length - 1 
              ? { ...item, answer, loading: false } 
              : item
          )
        );
      }, 1500);
    } catch (error) {
      console.error('Error processing follow-up question:', error);
      setFollowUpHistory(prev => 
        prev.map((item, idx) => 
          idx === prev.length - 1 
            ? { 
                ...item, 
                answer: "I'm sorry, I couldn't process your question. Please try again later.", 
                loading: false 
              } 
            : item
        )
      );
    }
  };

  const selectedFoodItem = foodItems.find(item => item.id === selectedFoodId || item._id === selectedFoodId);
  const selectedSeller = sellers.find(s => s.id === selectedSellerId || s._id === selectedSellerId);

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="restaurant-select">Select Restaurant</Label>
          <Select 
            value={selectedSellerId} 
            onValueChange={handleSellerChange}
            disabled={isLoadingSellers}
          >
            <SelectTrigger id="restaurant-select">
              <SelectValue placeholder="Choose a restaurant" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingSellers ? (
                <div className="p-2">
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : sellers.length === 0 ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  No restaurants available
                </div>
              ) : (
                sellers.map((seller: Seller) => (
                  <SelectItem 
                    key={seller.id || seller._id} 
                    value={seller.id || seller._id || ''}
                  >
                    {seller.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dish-select">Select Dish</Label>
          <Select 
            value={selectedFoodId} 
            onValueChange={handleFoodItemChange}
            disabled={!selectedSellerId || isLoadingFoodItems}
          >
            <SelectTrigger id="dish-select">
              <SelectValue placeholder="Choose a dish" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingFoodItems ? (
                <div className="p-2">
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : foodItems.length === 0 ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  No dishes available for this restaurant
                </div>
              ) : (
                foodItems.map((item: FoodItem) => (
                  <SelectItem 
                    key={item.id || item._id} 
                    value={item.id || item._id || ''}
                  >
                    {item.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full mt-4" 
          disabled={!selectedFoodId || isAnalyzing}
          onClick={checkNutrition}
        >
          {isAnalyzing ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Nutrition...
            </>
          ) : (
            'Check Nutritional Value'
          )}
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              <DialogHeader className="p-6 pb-2 sticky top-0 bg-background z-10 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      {selectedFoodItem?.name}
                      {!usingRealApi && (
                        <Badge variant="outline" className="ml-2 text-yellow-500 border-yellow-500">
                          Demo Mode
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription className="mt-1 flex items-center">
                      <span>from {selectedSeller?.name}</span>
                      {selectedFoodItem?.price && (
                        <Badge variant="secondary" className="ml-2">
                          ₹{selectedFoodItem.price}
                        </Badge>
                      )}
                    </DialogDescription>
                  </div>
                  
                  {selectedFoodItem?.imageUrl && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className="relative h-16 w-16 rounded-full overflow-hidden shrink-0 border-2 border-primary"
                    >
                      <img 
                        src={selectedFoodItem.imageUrl} 
                        alt={selectedFoodItem.name}
                        className="object-cover w-full h-full"
                      />
                    </motion.div>
                  )}
                </div>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                <div className="px-6 border-b sticky top-0 bg-background z-10">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="nutrition" className="text-base py-3 relative">
                      Nutrition Facts
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        initial={false}
                        animate={{ opacity: activeTab === "nutrition" ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="text-base py-3 relative">
                      Ask Questions
                      {followUpHistory.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {followUpHistory.length}
                        </Badge>
                      )}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        initial={false}
                        animate={{ opacity: activeTab === "questions" ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(85vh - 140px)' }}>
                  <div className="p-6">
                    <TabsContent value="nutrition" className="m-0">
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="relative">
                            <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-semibold">AI</span>
                            </div>
                          </div>
                          <p className="mt-4 text-lg font-medium">Analyzing nutritional content...</p>
                          <p className="text-muted-foreground mt-2">This may take a few moments</p>
                        </div>
                      ) : nutritionInfo ? (
                        <AnimatePresence>
                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-8"
                          >
                            <motion.div 
                              variants={itemVariants}
                              className="bg-muted p-6 rounded-lg"
                            >
                              <h3 className="text-xl font-semibold mb-6 border-b pb-2">Nutrition Facts</h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium text-lg">Calories</span>
                                    <span className="text-lg">{nutritionInfo.calories}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Protein</span>
                                    <span>{nutritionInfo.protein}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Carbohydrates</span>
                                    <span>{nutritionInfo.carbs}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Fat</span>
                                    <span>{nutritionInfo.fat}</span>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Fiber</span>
                                    <span>{nutritionInfo.fiber}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Sugar</span>
                                    <span>{nutritionInfo.sugar}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Sodium</span>
                                    <span>{nutritionInfo.sodium}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                            
                            {nutritionInfo.additionalInfo && (
                              <motion.div 
                                variants={itemVariants}
                                className="bg-secondary/20 p-6 rounded-lg"
                              >
                                <h4 className="font-medium mb-2 text-lg">Additional Insights</h4>
                                <p className="text-muted-foreground whitespace-normal">{nutritionInfo.additionalInfo}</p>
                              </motion.div>
                            )}
                            
                            <motion.div 
                              variants={itemVariants}
                              className="bg-muted/40 p-6 rounded-lg"
                            >
                              <h4 className="font-medium mb-3 text-lg">Dietary Information</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <Badge variant="outline" className="justify-center py-1">
                                  {parseInt(nutritionInfo.calories) < 350 ? "Low Calorie" : "High Calorie"}
                                </Badge>
                                <Badge variant="outline" className="justify-center py-1">
                                  {parseInt(nutritionInfo.sodium) < 400 ? "Low Sodium" : "High Sodium"}
                                </Badge>
                                <Badge variant="outline" className="justify-center py-1">
                                  {parseInt(nutritionInfo.protein) > 15 ? "High Protein" : "Moderate Protein"}
                                </Badge>
                                <Badge variant="outline" className="justify-center py-1">
                                  {parseInt(nutritionInfo.fiber) > 4 ? "High Fiber" : "Low Fiber"}
                                </Badge>
                                <Badge variant="outline" className="justify-center py-1">
                                  {parseInt(nutritionInfo.sugar) < 5 ? "Low Sugar" : "Contains Sugar"}
                                </Badge>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              variants={itemVariants}
                              className="bg-muted/30 p-6 rounded-lg"
                            >
                              <h4 className="font-medium mb-3 text-lg">Daily Value Percentage</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Based on a 2,000 calorie diet
                              </p>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span>Calories</span>
                                    <span>{Math.round((parseInt(nutritionInfo.calories) / 2000) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2.5">
                                    <div 
                                      className="bg-primary h-2.5 rounded-full" 
                                      style={{ width: `${Math.min(Math.round((parseInt(nutritionInfo.calories) / 2000) * 100), 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span>Protein</span>
                                    <span>{Math.round((parseInt(nutritionInfo.protein) / 50) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2.5">
                                    <div 
                                      className="bg-blue-500 h-2.5 rounded-full" 
                                      style={{ width: `${Math.min(Math.round((parseInt(nutritionInfo.protein) / 50) * 100), 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span>Fat</span>
                                    <span>{Math.round((parseInt(nutritionInfo.fat) / 65) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2.5">
                                    <div 
                                      className="bg-yellow-500 h-2.5 rounded-full" 
                                      style={{ width: `${Math.min(Math.round((parseInt(nutritionInfo.fat) / 65) * 100), 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span>Carbs</span>
                                    <span>{Math.round((parseInt(nutritionInfo.carbs) / 300) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2.5">
                                    <div 
                                      className="bg-green-500 h-2.5 rounded-full" 
                                      style={{ width: `${Math.min(Math.round((parseInt(nutritionInfo.carbs) / 300) * 100), 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              variants={itemVariants}
                              className="bg-muted/20 p-6 rounded-lg"
                            >
                              <h4 className="font-medium mb-2">Disclaimer</h4>
                              <p className="text-sm text-muted-foreground">
                                This nutritional information is generated by AI based on typical recipes and 
                                may not reflect the exact nutritional content of the dish as prepared by the restaurant.
                                For precise dietary information, please contact the restaurant directly.
                              </p>
                            </motion.div>
                          </motion.div>
                        </AnimatePresence>
                      ) : (
                        <div className="text-center text-muted-foreground py-12">
                          <p>Select a dish and click "Check Nutritional Value" to see nutrition facts</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="questions" className="m-0 space-y-6">
                      <div className="bg-muted/20 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Ask about {selectedFoodItem?.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Have questions about ingredients, preparation, or dietary considerations? Ask here!
                        </p>
                        
                        <form onSubmit={handleFollowUpSubmit} className="flex gap-2">
                          <Input
                            placeholder="Ask a follow-up question..."
                            value={followUpQuestion}
                            onChange={(e) => setFollowUpQuestion(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            type="submit" 
                            disabled={!followUpQuestion.trim()}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Ask
                          </Button>
                        </form>
                      </div>
                      
                      {followUpHistory.length > 0 ? (
                        <div className="space-y-4">
                          <AnimatePresence>
                            {followUpHistory.map((item, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-2"
                              >
                                <div className="bg-secondary/20 p-4 rounded-lg">
                                  <p className="font-medium">{item.question}</p>
                                </div>
                                
                                <div className="bg-muted p-4 rounded-lg">
                                  {item.loading ? (
                                    <div className="flex items-center gap-2">
                                      <Icons.spinner className="h-4 w-4 animate-spin" />
                                      <p className="text-muted-foreground">Generating response...</p>
                                    </div>
                                  ) : (
                                    <motion.p
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ duration: 0.5 }}
                                      className="whitespace-normal"
                                    >
                                      {item.answer}
                                    </motion.p>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No questions yet. Ask your first question above!</p>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </motion.div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 