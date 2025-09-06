// src/app/api/happiness/chat/route.ts (friendly AI version)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types
interface PermaScores {
  positive?: number;
  engagement?: number;
  relationships?: number;
  meaning?: number;
  accomplishment?: number;
  work_life_balance?: number;
}

// Structured questions based on the PERMA-W model
const permaQuestions = [
  {
    step: 1,
    dimension: 'positive',
    question: "To start, how would you describe your overall mood at work this week? How do you usually feel when arriving in the morning?"
  },
  {
    step: 2,
    dimension: 'positive', 
    question: "Can you tell me about a recent moment at work where you felt joy or genuine pleasure? Please give a concrete example."
  },
  {
    step: 3,
    dimension: 'engagement',
    question: "Describe a recent time when you were fully absorbed in your work—where time seemed to fly by."
  },
  {
    step: 4,
    dimension: 'engagement',
    question: "To what extent do you feel your skills and talents are being well utilized in your current role?"
  },
  {
    step: 5,
    dimension: 'relationships',
    question: "How would you describe the quality of your relationships with colleagues? Do you feel you have people you can rely on at work?"
  },
  {
    step: 6,
    dimension: 'relationships',
    question: "Do you feel heard and valued by your manager and team?"
  },
  {
    step: 7,
    dimension: 'meaning',
    question: "In what ways does your work feel meaningful to you? How do you feel you contribute to something bigger?"
  },
  {
    step: 8,
    dimension: 'meaning',
    question: "Do your personal values align with those of your organization? Can you give an example?"
  },
  {
    step: 9,
    dimension: 'accomplishment',
    question: "Which achievements from the past months are you most proud of?"
  },
  {
    step: 10,
    dimension: 'accomplishment',
    question: "How do you see your professional growth? Do you feel you are reaching your goals?"
  },
  {
    step: 11,
    dimension: 'work_life_balance',
    question: "How do you manage the balance between your work and personal life? Are you able to disconnect and recharge?"
  },
  {
    step: 12,
    dimension: 'work_life_balance',
    question: "Finally, is there anything you would like to change about your current work situation?"
  }
];

// Friendly AI scoring function
async function analyzeResponseWithAI(response: string, dimension: string, questionText: string): Promise<number> {
  try {
    const prompt = `You are an experienced and empathetic workplace psychologist. Analyze this response to a question about professional well-being.

EVALUATED DIMENSION: ${dimension}
QUESTION ASKED: "${questionText}"
EMPLOYEE RESPONSE: "${response}"

Give a score from 1 to 10, being kind but realistic, based on this scale:

9-10: Excellent - Very fulfilled, positive, proactive in this dimension
7-8: Good - Satisfactory with identifiable positive aspects
5-6: Fair - Acceptable situation, some normal challenges
3-4: Developing - Challenges exist but not alarming
1-2: Difficult - Concerning situation needing attention

KIND PRINCIPLES:
- Value expressed efforts and positive intentions
- Acknowledge that temporary challenges are normal at work
- Self-reflection and honesty are positive signs
- Do not penalize vulnerability or natural emotions
- Consider the professional context as inherently improvable
- Words like "fairly good", "okay", "acceptable" deserve 6-7/10
- Absence of major issues = minimum 5-6/10
- Long and thoughtful responses are valued

Respond ONLY with a decimal number (e.g., 6.5):`;

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 50
      }),
    });

    const completion = await aiResponse.json();
    const scoreText = completion.choices?.[0]?.message?.content?.trim() || '6';
    
    const scoreMatch = scoreText.match(/(\d+\.?\d*)/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 6;
    
    let finalScore = isNaN(score) ? 6 : Math.min(10, Math.max(1, score));
    
    if (finalScore < 4 && response.length > 50 && !response.toLowerCase().includes('terrible') && !response.toLowerCase().includes('horrible')) {
      finalScore = Math.max(4, finalScore);
    }
    
    console.log(`AI Scoring - Dimension: ${dimension}, Response: "${response.substring(0, 100)}...", Score: ${finalScore}`);
    
    return finalScore;
    
  } catch (error) {
    console.error('AI scoring error:', error);
    
    const lowerResponse = response.toLowerCase();
    const positiveIndicators = ['good', 'well', 'happy', 'satisfied', 'motivated', 'pleasure', 'team', 'goals', 'progress'];
    const negativeIndicators = ['bad', 'terrible', 'horrible', 'hate', 'impossible', 'never', 'none'];
    
    let fallbackScore = 6;
    
    if (response.length > 100) fallbackScore += 0.5;
    if (response.length > 200) fallbackScore += 0.5;
    
    const positiveCount = positiveIndicators.filter(word => lowerResponse.includes(word)).length;
    const negativeCount = negativeIndicators.filter(word => lowerResponse.includes(word)).length;
    
    fallbackScore += positiveCount * 0.5;
    fallbackScore -= negativeCount * 0.8;
    
    return Math.min(10, Math.max(3, Math.round(fallbackScore * 2) / 2));
  }
}

// Generate personalized advice
async function generatePersonalizedAdvice(permaScores: PermaScores, sessionId: string): Promise<string[]> {
  try {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('message_text, step_number')
      .eq('session_id', sessionId)
      .eq('is_bot_message', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    }

    const sortedScores = Object.entries(permaScores)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 3);

    const contextResponses = messages && messages.length > 0 
      ? messages.slice(0, 6).map(m => m.message_text).join(' ') 
      : '';

    const avgScore = Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length;

    const prompt = `You are an expert and empathetic workplace well-being coach. 

USER PROFILE:
- Average score: ${avgScore.toFixed(1)}/10
${Object.entries(permaScores).map(([dim, score]) => `- ${dim}: ${score}/10`).join('\n')}

PRIORITY AREAS (lowest scores):
${sortedScores.map(([dim, score]) => `- ${dim}: ${score}/10`).join('\n')}

CONTEXT (sample responses): "${contextResponses.substring(0, 400)}..."

TASK: Create 3 short, encouraging, actionable tips (max 4 lines each).

TONE: ${avgScore >= 7 ? 'Encouraging and optimizing' : avgScore >= 5 ? 'Supportive and constructive' : 'Kind and reassuring'}

RULES:
✅ Casual and friendly tone
✅ Practical and achievable tips
✅ Focus on weak areas BUT stay positive
✅ Max 4-5 lines per tip
✅ Start with an appropriate emoji
✅ Avoid medical/clinical terms
✅ Highlight what already works

EXACT FORMAT:
1. [emoji] [short actionable tip]
2. [emoji] [short actionable tip]
3. [emoji] [short actionable tip]

Respond ONLY with the 3 numbered tips.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 600
      }),
    });

    const completion = await response.json();
    const aiResponse = completion.choices?.[0]?.message?.content ?? '';
    
    const adviceLines = aiResponse
      .split('\n')
      .filter((line: string) => /^\d+\.\s/.test(line.trim()))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);

    while (adviceLines.length < 3) {
      const fallbackAdvice = avgScore >= 7 
        ? "🚀 Keep up the great work! Share your best practices with colleagues"
        : avgScore >= 5
        ? "💡 Identify one small thing to improve this week and go for it"
        : "🌱 Remember that every small step counts; you're not alone in this journey";
      
      adviceLines.push(fallbackAdvice);
    }

    console.log('Generated advice:', adviceLines);
    return adviceLines;

  } catch (error) {
    console.error('Advice generation error:', error);
    
    const avgScore = Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length;
    
    if (avgScore >= 7) {
      return [
        "🎯 You're on the right track! Keep nurturing what makes you happy at work",
        "🤝 Share your positive energy with colleagues—it can do wonders",
        "📈 Use this momentum to set a new stimulating challenge"
      ];
    } else if (avgScore >= 5) {
      return [
        "🌱 Pick one aspect of your work to improve and start small",
        "☕ Take time to chat with colleagues; relationships often make the difference",
        "⏸️ Give yourself real breaks during the day; your brain needs to rest"
      ];
    } else {
      return [
        "🫂 Remember, you are not alone—feel free to share your struggles",
        "🎯 Set very simple goals to gradually regain confidence",
        "🌅 Each new day is a chance to see things differently"
      ];
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;
    
    const sessionToken = request.headers.get('x-session-token');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Missing session token' },
        { status: 401 }
      );
    }

    const { data: session, error: sessionError } = await supabase
      .from('happiness_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();
    
    if (sessionError || !session) {
      console.error('Session fetch error:', sessionError);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.timeout_at && new Date() > new Date(session.timeout_at)) {
      await supabase
        .from('happiness_sessions')
        .update({ 
          status: 'timeout',
          last_activity: new Date().toISOString()
        })
        .eq('session_token', sessionToken);
      
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 410 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'This assessment has already been completed' },
        { status: 400 }
      );
    }

    let currentStep = session.current_step || 0;
    let permaScores: PermaScores = {};
    
    if (session.perma_scores) {
      try {
        permaScores = typeof session.perma_scores === 'string' 
          ? JSON.parse(session.perma_scores) 
          : session.perma_scores;
      } catch (e) {
        console.error('Error parsing existing scores:', e);
        permaScores = {};
      }
    }
    
    if (currentStep > 0 && currentStep <= permaQuestions.length) {
      const currentQuestion = permaQuestions[currentStep - 1];
      
      const score = await analyzeResponseWithAI(
        message, 
        currentQuestion.dimension, 
        currentQuestion.question
      );
      
      permaScores = {
        ...permaScores,
        [currentQuestion.dimension]: score
      };
      
      console.log(`Step ${currentStep}: AI Score for ${currentQuestion.dimension}: ${score}`);
    }

    currentStep += 1;

    let response: string;
    let completed = false;
    let personalizedAdvice: string[] = [];

    if (currentStep <= permaQuestions.length) {
      const nextQuestion = permaQuestions[currentStep - 1];
      response = nextQuestion.question;
    } else {
      completed = true;
      
      const avgScore = Object.keys(permaScores).length > 0 
        ? Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length
        : 6;

      personalizedAdvice = await generatePersonalizedAdvice(permaScores, session.id);

      let endMessage = "";
      if (avgScore >= 8) {
        endMessage = "Fantastic! Your workplace well-being is shining positively. Keep cultivating this great energy! 🌟";
      } else if (avgScore >= 6.5) {
        endMessage = "Very good! You have solid foundations for your professional well-being. A few tweaks can make you shine even more! ✨";
      } else if (avgScore >= 5) {
        endMessage = "Your situation has good potential for improvement. The tips below will help you reach new heights! 🚀";
      } else {
        endMessage = "Thank you for your honesty. Your answers show real challenges, but remember that everything can improve with the right strategies and support. 💙";
      }

      response = `Thank you for sharing your sincere thoughts! 🎉

Your well-being assessment is now complete. Here’s a summary of your results:

**Overall workplace well-being score: ${Math.round(avgScore * 10) / 10}/10**

${endMessage}

This assessment is completely anonymous and designed to support overall employee well-being within the company.`;
    }

    const updateData: {
      current_step: number;
      status: 'completed' | 'in_progress';
      last_activity: string;
      perma_scores?: PermaScores;
      completed_at?: string;
      overall_happiness_score?: number;
    } = {
      current_step: currentStep,
      status: completed ? 'completed' : 'in_progress',
      last_activity: new Date().toISOString()
    };

    if (permaScores && Object.keys(permaScores).length > 0) {
      updateData.perma_scores = permaScores;
    }

    if (completed) {
      updateData.completed_at = new Date().toISOString();
      const avgScore = Object.keys(permaScores).length > 0 
        ? Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length
        : 6;
      updateData.overall_happiness_score = Math.round(avgScore);
    }

    console.log('Session update:', { sessionId: session.id, currentStep, scores: permaScores });

    const { error: updateError } = await supabase
      .from('happiness_sessions')
      .update(updateData)
      .eq('session_token', sessionToken);

    if (updateError) {
      console.error('Session update error:', updateError);
      return NextResponse.json(
        { error: 'Session update error' },
        { status: 500 }
      );
    }

    await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: session.id,
          message_text: message,
          is_bot_message: false,
          step_number: currentStep - 1,
          message_type: currentStep <= permaQuestions.length ? 'question' : 'completion'
        },
        {
          session_id: session.id,
          message_text: response,
          is_bot_message: true,
          step_number: currentStep,
          message_type: completed ? 'completion' : 'question'
        }
      ]);

    const sessionUpdate = {
      response,
      step: currentStep,
      completed,
      scores: permaScores,
      personalizedAdvice: completed ? personalizedAdvice : undefined
    };

    return NextResponse.json(sessionUpdate);

  } catch (error) {
    console.error('Error in POST /api/happiness/chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
