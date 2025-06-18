'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { foodApi } from '@/lib/api/food';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Seller, FoodItem } from '@/lib/types/models';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/ui/icons';
import { 
  analyzeFoodNutrition, 
  getMockNutritionInfo, 
  NutritionInfo 
} from '@/lib/api/nutrition';

export function NutritionAnalyzer() {
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Flag to track if we're using the real API
  const [usingRealApi, setUsingRealApi] = useState(false);

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
    setSheetOpen(true);
    
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

  const selectedFoodItem = foodItems.find(item => item.id === selectedFoodId || item._id === selectedFoodId);

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

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
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
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl">
                {selectedFoodItem?.name} Nutrition Facts
              </SheetTitle>
              <SheetDescription>
                Nutritional analysis for {selectedFoodItem?.name}
                {!usingRealApi && (
                  <span className="block mt-1 text-yellow-500 text-xs">
                    (Using AI-generated estimates)
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {isAnalyzing ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                  </div>
                  <p className="text-center">Analyzing nutritional content...</p>
                </div>
              ) : nutritionInfo ? (
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Nutrition Facts</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Calories</span>
                        <span>{nutritionInfo.calories}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Protein</span>
                        <span>{nutritionInfo.protein}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Carbohydrates</span>
                        <span>{nutritionInfo.carbs}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Fat</span>
                        <span>{nutritionInfo.fat}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Fiber</span>
                        <span>{nutritionInfo.fiber}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Sugar</span>
                        <span>{nutritionInfo.sugar}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Sodium</span>
                        <span>{nutritionInfo.sodium}</span>
                      </div>
                    </div>
                  </div>
                  
                  {nutritionInfo.additionalInfo && (
                    <div className="text-sm text-muted-foreground">
                      <p>{nutritionInfo.additionalInfo}</p>
                    </div>
                  )}
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Disclaimer</h4>
                    <p className="text-sm text-muted-foreground">
                      This nutritional information is generated by AI based on typical recipes and 
                      may not reflect the exact nutritional content of the dish as prepared by the restaurant.
                      For precise dietary information, please contact the restaurant directly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Select a dish and click "Check Nutritional Value" to see nutrition facts</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
} 