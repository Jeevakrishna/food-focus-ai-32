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
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function analyzeImageWithGroq(imageBytes: Uint8Array): Promise<string> {
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
  return data.choices[0].message.content.trim();
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

    // Use Groq AI to analyze the image
    const prediction = await analyzeImageWithGroq(imageBytes);
    console.log('Groq AI prediction:', prediction);

    // Map the prediction to nutritional information
    const foodInfo = findClosestFood(prediction);

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