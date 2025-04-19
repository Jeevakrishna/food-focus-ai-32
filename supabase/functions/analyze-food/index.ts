
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { findInLocalDatabase } from "./database.ts";
import { calculateMacroPercentages, corsHeaders } from "./utils.ts";

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
      const macroPercentages = calculateMacroPercentages(
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
          macroPercentages
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
    
    const macroPercentages = calculateMacroPercentages(
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
        macroPercentages
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
