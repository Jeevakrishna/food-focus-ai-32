import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: "You are a nutritionist AI that analyzes food images. Always respond in JSON format with the following structure: { description: string, calories: number, protein: number, carbs: number, fat: number }. The image will be taken from approximately 1 foot away from the plate."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What food is in this image? Please provide nutritional information." },
              { type: "image_url", image_url: image }
            ]
          }
        ]
      })
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    const nutritionInfo = JSON.parse(content)

    return new Response(JSON.stringify(nutritionInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to analyze image' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})