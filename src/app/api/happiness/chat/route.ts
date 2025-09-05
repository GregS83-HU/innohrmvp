// src/app/api/happiness/chat/route.ts

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
    question: "To start, how would you describe your overall mood at work this week? How do you usually feel when you arrive in the morning?"
  },
  {
    step: 2,
    dimension: 'positive', 
    question: "Can you tell me about a recent moment at work when you felt joy or real pleasure? Please share a concrete example."
  },
  {
    step: 3,
    dimension: 'engagement',
    question: "Describe a recent time when you were completely absorbed in your work—when time seemed to fly by."
  },
  {
    step: 4,
    dimension: 'engagement',
    question: "To what extent do you feel your skills and talents are being used well in your current role?"
  },
  {
    step: 5,
    dimension: 'relationships',
    question: "How would you describe the quality of your relationships with your colleagues? Do you feel you have people you can rely on at work?"
  },
  {
    step: 6,
    dimension: 'relationships',
    question: "Do you feel listened to and valued by your manager and your team?"
  },
  {
    step: 7,
    dimension: 'meaning',
    question: "In what ways does your work feel meaningful to you? How do you feel you’re contributing to something bigger?"
  },
  {
    step: 8,
    dimension: 'meaning',
    question: "Do your personal values feel aligned with those of your organization? Can you give me an example?"
  },
  {
    step: 9,
    dimension: 'accomplishment',
    question: "Which achievements from the past few months are you most proud of?"
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

// Function to analyze the response and assign a score
function analyzeResponseAndScore(response: string, dimension: keyof PermaScores): number {
  const lowerResponse = response.toLowerCase();
  
  // Positive and negative words per dimension (in English equivalents of French keywords)
  const positiveWords: Record<string, string[]> = {
    positive: ['happy', 'content', 'joyful', 'motivated', 'enthusiastic', 'satisfied', 'fulfilled', 'good', 'great', 'amazing', 'excellent', 'fantastic', 'pleasure'],
    engagement: ['passionate', 'absorbed', 'focused', 'involved', 'engaged', 'stimulating', 'challenge', 'flow', 'skills', 'talents'],
    relationships: ['support', 'team', 'collaboration', 'trust', 'friendly', 'respectful', 'communication', 'listened', 'caring'],
    meaning: ['meaning', 'mission', 'impact', 'contribution', 'values', 'purpose', 'useful', 'important', 'significant', 'aligned'],
    accomplishment: ['proud', 'success', 'goals', 'progress', 'achievement', 'accomplishment', 'performance', 'results'],
    work_life_balance: ['balance', 'disconnect', 'time', 'family', 'hobbies', 'rest', 'flexible', 'schedule', 'vacation']
  };

  const negativeWords: Record<string, string[]> = {
    positive: ['sad', 'unmotivated', 'bored', 'frustrated', 'depressed', 'unhappy', 'stressed', 'anxious', 'difficult', 'hard'],
    engagement: ['boring', 'repetitive', 'monotonous', 'disengaged', 'underused', 'waste', 'routine'],
    relationships: ['conflict', 'isolated', 'misunderstood', 'tension', 'poor communication', 'alone', 'ignored'],
    meaning: ['useless', 'empty', 'meaningless', 'misaligned', 'contradiction', 'opposing values'],
    accomplishment: ['failure', 'stagnation', 'regression', 'goals not reached', 'disappointed', 'unsatisfied'],
    work_life_balance: ['overwhelmed', 'exhausted', 'burnout', 'no time', 'always connected', 'sacrifice']
  };

  let score = 5; // Neutral baseline
  
  // Count positive words
  const dimPositive = positiveWords[dimension] || [];
  const positiveCount = dimPositive.filter(word => lowerResponse.includes(word)).length;
  
  // Count negative words
  const dimNegative = negativeWords[dimension] || [];
  const negativeCount = dimNegative.filter(word => lowerResponse.includes(word)).length;
  
  // Adjust score
  score += positiveCount * 1.5;
  score -= negativeCount * 1.5;
  
  // Longer, detailed answers suggest higher engagement
  if (response.length > 100) {
    score += 0.5;
  }
  
  // Keep score between 1 and 10
  return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;
    
    // Get session token
    const sessionToken = request.headers.get('x-session-token');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Missing session token' },
        { status: 401 }
      );
    }

    // Retrieve session from Supabase
    const { data: session, error: sessionError } = await supabase
      .from('happiness_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();
    
    if (sessionError || !session) {
      console.error('Error retrieving session:', sessionError);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session expired
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

    // Get current session data
    let currentStep = session.current_step || 0;
    let permaScores: PermaScores = {};
    
    // Parse existing scores if available
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
    
    // Analyze response and update scores if not first message
    if (currentStep > 0 && currentStep <= permaQuestions.length) {
      const currentQuestion = permaQuestions[currentStep - 1];
      const score = analyzeResponseAndScore(message, currentQuestion.dimension as keyof PermaScores);
      
      permaScores = {
        ...permaScores,
        [currentQuestion.dimension]: score
      };
      
      console.log(`Step ${currentStep}: Analyzed response for ${currentQuestion.dimension}, score: ${score}`);
    }

    // Move to next step
    currentStep += 1;

    let response: string;
    let completed = false;

    if (currentStep <= permaQuestions.length) {
      // Ask next question
      const nextQuestion = permaQuestions[currentStep - 1];
      response = nextQuestion.question;
    } else {
      // Assessment completed
      completed = true;
      
      const avgScore = Object.keys(permaScores).length > 0 
        ? Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length
        : 5;

      response = `Thank you for sharing your honest reflections! 🎉

Your well-being assessment is now complete. Here’s a quick summary of your results:

**Overall workplace well-being score: ${Math.round(avgScore * 10) / 10}/10**

${
  avgScore >= 8 
    ? "Fantastic! You seem to be thriving at work—keep building on this positive momentum. 😊"
    : avgScore >= 6 
    ? "Your workplace well-being is generally positive, though there may be areas to improve. 🙂"
    : "It looks like you may be facing some significant challenges regarding your professional well-being. Don’t hesitate to reach out to your manager or HR for support. 💙"
}

This assessment is fully anonymous and designed to help improve the overall well-being of employees within the company.`;
    }

    
    // Prepare update data
   const updateData: Record<string, unknown> = {
      current_step: currentStep,
      status: completed ? 'completed' : 'in_progress',
      last_activity: new Date().toISOString()
    };

    // Add scores
    if (permaScores && Object.keys(permaScores).length > 0) {
      updateData.perma_scores = permaScores;
    }

    // Add completion timestamp
    if (completed) {
      updateData.completed_at = new Date().toISOString();
      
      // Calculate and store overall score
      const avgScore = Object.keys(permaScores).length > 0 
        ? Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length
        : 5;
      updateData.overall_happiness_score = Math.round(avgScore);
    }

    console.log('Attempting to update session with:', updateData);

    // Update session
    const { error: updateError } = await supabase
      .from('happiness_sessions')
      .update(updateData)
      .eq('session_token', sessionToken);

    if (updateError) {
      console.error('Error updating session:', updateError);
      return NextResponse.json(
        { error: 'Error updating session' },
        { status: 500 }
      );
    }

    // Store messages in history
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
      scores: permaScores
    };

    console.log('Response sent:', sessionUpdate);

    return NextResponse.json(sessionUpdate);

  } catch (error) {
    console.error('Error in POST /api/happiness/chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
