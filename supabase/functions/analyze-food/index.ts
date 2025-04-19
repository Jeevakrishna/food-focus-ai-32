import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Food database with nutritional information from Foods_data.csv
const nutritionDatabase = {
  "dosa": { calories: 133, protein: 3.5, carbs: 25.2, fat: 2.1, region: "South Indian" },
  "idli": { calories: 85, protein: 2.5, carbs: 18.2, fat: 0.2, region: "South Indian" },
  "sambar": { calories: 140, protein: 5, carbs: 23, fat: 4, region: "South Indian" },
  "butter chicken": { calories: 485, protein: 28, carbs: 12, fat: 38, region: "North Indian" },
  "naan": { calories: 260, protein: 9, carbs: 48, fat: 3.3, region: "North Indian" },
  "biryani": { calories: 292, protein: 19, carbs: 25, fat: 14, region: "North Indian" },
  "palak paneer": { calories: 260, protein: 11, carbs: 10, fat: 20, region: "North Indian" },
  "masala dosa": { calories: 387, protein: 8, carbs: 52, fat: 18, region: "South Indian" },
  "vada": { calories: 97, protein: 4.1, carbs: 18.2, fat: 0.9, region: "South Indian" },
  "puri": { calories: 101, protein: 3, carbs: 14, fat: 4.2, region: "North Indian" },
  "chapati": { calories: 120, protein: 4, carbs: 20, fat: 3.5, region: "North Indian" }
};

// Find the closest match in the database
function findInLocalDatabase(foodName) {
  const normalizedName = foodName.toLowerCase().trim();
  
  // Check exact matches first
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (normalizedName === key) {
      return { ...value, confidence: 1, source: 'local' };
    }
  }
  
  // Then check partial matches
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return { ...value, confidence: 0.8, source: 'local' };
    }
  }
  
  return null;
}

// Calculate macronutrient percentages
function calculateMacroPercentages(calories, protein, carbs, fat) {
  const proteinCalories = protein * 4;
  const carbCalories = carbs * 4;
  const fatCalories = fat * 9;
  const totalCalories = proteinCalories + carbCalories + fatCalories;
  
  return {
    proteinPercentage: Math.round((proteinCalories / totalCalories) * 100) || 0,
    carbsPercentage: Math.round((carbCalories / totalCalories) * 100) || 0,
    fatPercentage: Math.round((fatCalories / totalCalories) * 100) || 0
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, image } = await req.json();
    
    if (!image) {
      throw new Error('No image provided');
    }

    console.log('Processing image data...');
    
    // Get the food prediction (using our mock function instead of actual AI)
    const recognitionResult = recognizeFood(image);
    console.log('Food prediction:', recognitionResult.prediction);
    
    // Try to find in local database
    const localMatch = findInLocalDatabase(recognitionResult.prediction);
    
    if (localMatch) {
      console.log('Found match in local database:', localMatch);
      const { proteinPercentage, carbsPercentage, fatPercentage } = calculateMacroPercentages(
        localMatch.calories,
        localMatch.protein,
        localMatch.carbs,
        localMatch.fat
      );
      
      return new Response(
        JSON.stringify({
          description: recognitionResult.prediction,
          ...localMatch,
          confidence: localMatch.confidence,
          source: 'local',
          macroPercentages: {
            protein: proteinPercentage,
            carbs: carbsPercentage,
            fat: fatPercentage
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no local match found, use default values
    console.log('No local match found, using default values');
    const defaultValues = {
      calories: 200,
      protein: 10,
      carbs: 25,
      fat: 8,
      region: "Unknown"
    };
    
    const { proteinPercentage, carbsPercentage, fatPercentage } = calculateMacroPercentages(
      defaultValues.calories,
      defaultValues.protein,
      defaultValues.carbs,
      defaultValues.fat
    );
    
    return new Response(
      JSON.stringify({
        description: recognitionResult.prediction,
        ...defaultValues,
        confidence: recognitionResult.confidence,
        source: 'ai',
        macroPercentages: {
          protein: proteinPercentage,
          carbs: carbsPercentage,
          fat: fatPercentage
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-food function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Failed to analyze image: ${error.message}`,
        details: error.toString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
