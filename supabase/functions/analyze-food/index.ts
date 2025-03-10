
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const nutritionDatabase = {
  pizza: { calories: 266, protein: 11, carbs: 33, fat: 10 },
  burger: { calories: 354, protein: 20, carbs: 29, fat: 17 },
  salad: { calories: 100, protein: 3, carbs: 11, fat: 7 },
  pasta: { calories: 288, protein: 12, carbs: 57, fat: 2 },
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  chicken: { calories: 335, protein: 38, carbs: 0, fat: 20 },
  fish: { calories: 206, protein: 22, carbs: 0, fat: 12 },
  sandwich: { calories: 250, protein: 12, carbs: 34, fat: 8 },
  apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  orange: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  yogurt: { calories: 59, protein: 3.5, carbs: 5, fat: 3.3 },
  eggs: { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  cheese: { calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  nuts: { calories: 607, protein: 21, carbs: 20, fat: 54 },
  chocolate: { calories: 546, protein: 4.9, carbs: 61, fat: 31 },
};

function findInLocalDatabase(foodName: string) {
  const normalizedName = foodName.toLowerCase().trim();
  
  // Check exact matches first
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (normalizedName === key) {
      return { ...value, confidence: 1, source: 'local' as const };
    }
  }
  
  // Then check partial matches
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return { ...value, confidence: 0.8, source: 'local' as const };
    }
  }
  
  return null;
}

async function base64ToBytes(base64String: string): Promise<Uint8Array> {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function analyzeImageWithGroq(imageBytes: Uint8Array): Promise<{ prediction: string; confidence: number }> {
  const base64Image = btoa(String.fromCharCode(...imageBytes));
  
  const prompt = `You are a food recognition AI. Analyze this image and tell me what food item it is. 
                 Respond with ONLY the food name, nothing else. For example: "Pizza" or "Chicken Salad".
                 Here's the base64 encoded image: ${base64Image}`;

  const response = await fetch('https://api.groq.com/v1/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 50,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    prediction: data.choices[0].message.content.trim(),
    confidence: 0.9 // Assuming high confidence for AI predictions
  };
}

// Calculate macronutrient percentages
function calculateMacroPercentages(calories: number, protein: number, carbs: number, fat: number) {
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

    // First try local database match using Groq prediction
    const groqResult = await analyzeImageWithGroq(imageBytes);
    console.log('Groq AI prediction:', groqResult.prediction);
    
    // Try to find in local database first
    const localMatch = findInLocalDatabase(groqResult.prediction);
    
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
          description: groqResult.prediction,
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

    // If no local match found, use the Groq prediction with default nutritional values
    console.log('No local match found, using AI prediction with default values');
    const defaultValues = {
      calories: 200,
      protein: 10,
      carbs: 25,
      fat: 8,
    };
    
    const { proteinPercentage, carbsPercentage, fatPercentage } = calculateMacroPercentages(
      defaultValues.calories,
      defaultValues.protein,
      defaultValues.carbs,
      defaultValues.fat
    );
    
    return new Response(
      JSON.stringify({
        description: groqResult.prediction,
        ...defaultValues,
        confidence: groqResult.confidence,
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
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
