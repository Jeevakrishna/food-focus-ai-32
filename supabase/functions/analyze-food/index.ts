
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';
import { findInLocalDatabase } from "./database.ts";
import { calculateMacroPercentages, corsHeaders } from "./utils.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image provided');
    }

    // Initialize Hugging Face inference
    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'));
    
    // Classify the image using a food recognition model
    const result = await hf.imageClassification({
      model: 'nateraw/food',
      data: image
    });

    console.log('AI Recognition result:', result);

    if (!result || result.length === 0) {
      throw new Error('Could not recognize food in image');
    }

    // Get the top prediction
    const topPrediction = result[0];
    const predictedFood = topPrediction.label;
    const confidence = topPrediction.score;

    console.log('Predicted food:', predictedFood, 'with confidence:', confidence);
    
    // Try to find match in local database
    const localMatch = findInLocalDatabase(predictedFood);
    
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
          description: predictedFood,
          ...localMatch,
          confidence: confidence,
          source: 'ai',
          macroPercentages
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no local match found, use default values with lower confidence
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
        description: predictedFood,
        ...defaultValues,
        confidence: confidence * 0.8, // Reduce confidence for default values
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
