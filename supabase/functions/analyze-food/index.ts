import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping of common food items to their approximate nutritional values
const nutritionDatabase = {
  pizza: { calories: 266, protein: 11, carbs: 33, fat: 10 },
  burger: { calories: 354, protein: 20, carbs: 29, fat: 17 },
  salad: { calories: 100, protein: 3, carbs: 11, fat: 7 },
  pasta: { calories: 288, protein: 12, carbs: 57, fat: 2 },
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  chicken: { calories: 335, protein: 38, carbs: 0, fat: 20 },
  fish: { calories: 206, protein: 22, carbs: 0, fat: 12 },
  sandwich: { calories: 250, protein: 12, carbs: 34, fat: 8 },
};

function findClosestFood(prediction: string): any {
  const normalizedPrediction = prediction.toLowerCase();
  
  for (const [food, nutrition] of Object.entries(nutritionDatabase)) {
    if (normalizedPrediction.includes(food)) {
      return { description: prediction, ...nutrition };
    }
  }
  
  return {
    description: prediction,
    calories: 200,
    protein: 10,
    carbs: 25,
    fat: 8
  };
}

async function base64ToBytes(base64String: string): Promise<Uint8Array> {
  // Remove the data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  
  // Decode base64 to bytes
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image provided');
    }

    console.log('Processing image data...');
    const imageBytes = await base64ToBytes(image);

    // Initialize Hugging Face client
    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'));
    console.log('Initialized Hugging Face client');

    // Use a food classification model
    const result = await hf.imageClassification({
      model: 'nateraw/food',
      data: imageBytes,
    });

    console.log('Classification result:', result);

    if (!result || !result[0]) {
      throw new Error('No classification results returned');
    }

    // Get the top prediction
    const topPrediction = result[0];
    const foodInfo = findClosestFood(topPrediction.label);

    return new Response(JSON.stringify(foodInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-food function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Failed to analyze image: ${error.message}`,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});