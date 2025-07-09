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

    const { level, recentTopics, incorrectTopics } = await req.json();

    // Define algebra topics by difficulty level
    const topicsByLevel = {
      1: ['Basic Variables', 'Simple Addition/Subtraction with Variables'],
      2: ['Linear Equations', 'Solving for Variables', 'Coefficients'],
      3: ['Multi-step Equations', 'Distributive Property', 'Combining Like Terms'],
      4: ['Complex Linear Equations', 'Equations with Fractions', 'Word Problems'],
      5: ['Systems of Equations', 'Quadratic Equations', 'Advanced Word Problems']
    };

    // Select topic based on level and recent performance
    const availableTopics = topicsByLevel[level as keyof typeof topicsByLevel] || topicsByLevel[2];
    let selectedTopic;
    
    // Prioritize topics the student has struggled with
    if (incorrectTopics && incorrectTopics.length > 0) {
      const strugglingTopics = availableTopics.filter(topic => 
        incorrectTopics.includes(topic)
      );
      selectedTopic = strugglingTopics.length > 0 ? 
        strugglingTopics[Math.floor(Math.random() * strugglingTopics.length)] :
        availableTopics[Math.floor(Math.random() * availableTopics.length)];
    } else {
      selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
    }

    const prompt = `Generate a multiple choice algebra problem for a middle school student at difficulty level ${level}/5. 

Topic: ${selectedTopic}

Requirements:
- Create 1 algebra problem appropriate for level ${level}
- Include exactly 4 multiple choice options (A, B, C, D)
- One option should be correct, three should be plausible incorrect answers
- Provide a clear, step-by-step explanation for the correct answer
- Use age-appropriate language for middle school students
- Make the problem engaging and practical when possible

For level ${level}, focus on: ${availableTopics.join(', ')}

Return ONLY a valid JSON object in this exact format:
{
  "question": "Problem statement here",
  "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"],
  "correct": "A) correct option",
  "explanation": "Step-by-step explanation of how to solve this problem",
  "topic": "${selectedTopic}"
}`;

    console.log('Sending request to OpenAI with prompt:', prompt);

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
            content: 'You are an expert middle school algebra teacher who creates engaging, educational problems. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('OpenAI response:', generatedContent);

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

    console.log('Generated problem:', problemData);

    return new Response(JSON.stringify(problemData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in generate-algebra-problem function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate algebra problem'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});