import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { level } = await req.json();

    // Define assessment criteria by level
    const assessmentCriteria = {
      1: {
        topics: ['Basic Variables', 'Simple Addition/Subtraction'],
        description: 'very basic algebra concepts for beginners'
      },
      2: {
        topics: ['Linear Equations', 'Coefficients', 'Like Terms'],
        description: 'fundamental linear equations and variable concepts'
      },
      3: {
        topics: ['Multi-step Equations', 'Distributive Property'],
        description: 'intermediate algebra with multiple steps'
      },
      4: {
        topics: ['Complex Equations', 'Word Problems', 'Fractions'],
        description: 'advanced linear algebra and word problems'
      },
      5: {
        topics: ['Systems of Equations', 'Quadratic Concepts'],
        description: 'complex algebra concepts and systems'
      }
    };

    const criteria = assessmentCriteria[level as keyof typeof assessmentCriteria] || assessmentCriteria[2];

    const prompt = `Generate a multiple choice algebra assessment problem for a middle school student to test level ${level}/5 competency.

Assessment Level: ${level}
Topics to Test: ${criteria.topics.join(', ')}
Complexity: ${criteria.description}

Requirements:
- Create 1 algebra problem that accurately assesses ${criteria.description}
- Include exactly 4 multiple choice options (A, B, C, D)
- One option should be correct, three should be realistic incorrect answers
- The problem should be neither too easy nor too hard for level ${level}
- Use clear, age-appropriate language for middle school students
- Make the incorrect answers plausible (common mistakes students might make)

Return ONLY a valid JSON object in this exact format:
{
  "question": "Problem statement here",
  "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"],
  "correct": "A) correct option",
  "explanation": "Brief explanation of the correct answer",
  "assessmentLevel": ${level}
}`;

    console.log('Sending assessment request to OpenAI with level:', level);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert middle school algebra teacher who creates accurate assessment problems. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('OpenAI assessment response:', generatedContent);

    let problemData;
    try {
      problemData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate the response structure
    if (!problemData.question || !problemData.options || !problemData.correct || !problemData.explanation) {
      throw new Error('Incomplete problem data from OpenAI');
    }

    console.log('Generated assessment problem:', problemData);

    return new Response(JSON.stringify(problemData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in generate-assessment-problem function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate assessment problem'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});