import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a nutritionist AI that analyzes food images. The image will be taken from approximately 1 foot away from the plate. Always respond in valid JSON format with the following structure: { description: string, calories: number, protein: number, carbs: number, fat: number }. Be precise with the nutritional values."
          },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "What food is in this image? Please provide nutritional information." 
              },
              {
                type: "image_url",
                image_url: image
              }
            ]
          }
        ]
      })
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      throw new Error('Failed to analyze image with OpenAI');
    }

    const data = await openAIResponse.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    // Validate the response format
    if (!analysis.description || 
        typeof analysis.calories !== 'number' || 
        typeof analysis.protein !== 'number' || 
        typeof analysis.carbs !== 'number' || 
        typeof analysis.fat !== 'number') {
      throw new Error('Invalid response format from AI');
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-food function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze image: ' + error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});