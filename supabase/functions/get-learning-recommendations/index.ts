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

    const { 
      currentLevel, 
      totalProblems, 
      correctAnswers, 
      streakCount, 
      topicsCompleted, 
      incorrectTopics 
    } = await req.json();

    const accuracy = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0;

    const prompt = `As an AI algebra tutor, analyze this middle school student's learning data and provide personalized recommendations.

Student Progress:
- Current Level: ${currentLevel}/10
- Total Problems Solved: ${totalProblems}
- Accuracy Rate: ${accuracy.toFixed(1)}%
- Current Streak: ${streakCount}
- Topics Practiced: ${topicsCompleted.join(', ') || 'None yet'}
- Topics with Difficulties: ${incorrectTopics?.join(', ') || 'None identified'}

Provide recommendations in the following areas:
1. Next learning goals (specific topics to focus on)
2. Study strategies based on their performance patterns
3. Motivation and encouragement tailored to their progress
4. Specific skills to practice at their level

Return ONLY a valid JSON object in this exact format:
{
  "nextGoals": ["goal 1", "goal 2", "goal 3"],
  "studyStrategies": ["strategy 1", "strategy 2"],
  "motivation": "encouraging message based on their progress",
  "practiceAreas": ["area 1", "area 2"],
  "levelAdvice": "specific advice for their current level"
}`;

    console.log('Getting learning recommendations for user:', user.id);

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
            content: 'You are an expert middle school algebra tutor who provides personalized learning recommendations. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('OpenAI recommendations response:', generatedContent);

    let recommendationsData;
    try {
      recommendationsData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate the response structure
    if (!recommendationsData.nextGoals || !recommendationsData.studyStrategies || !recommendationsData.motivation) {
      throw new Error('Incomplete recommendations data from OpenAI');
    }

    console.log('Generated recommendations:', recommendationsData);

    return new Response(JSON.stringify(recommendationsData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-learning-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate learning recommendations'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});