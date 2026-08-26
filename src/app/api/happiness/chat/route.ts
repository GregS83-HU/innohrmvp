// src/app/api/happiness/chat/route.ts (Multi-language version - TypeScript strict)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPrompt, fillPromptVariables, PromptNotFoundError, PromptDatabaseError } from '../../../../../lib/prompts';
import { safeErrorInfo } from '../../../../../lib/logSafe';

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

interface PermaQuestion {
  step: number;
  dimension: keyof PermaScores;
  question: string;
}

interface ChatMessage {
  message_text: string;
  step_number: number;
}

interface EndMessageSet {
  excellent: string;
  good: string;
  improvable: string;
  poor: string;
}

type SupportedLanguage = 'en' | 'hu';

// Multi-language questions
const permaQuestionsMap: Record<SupportedLanguage, PermaQuestion[]> = {
  en: [
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
  ],
  hu: [
    {
      step: 1,
      dimension: 'positive',
      question: "Kezdésként, hogyan jellemeznéd az általános hangulatodat a munkahelyeden ezen a héten? Hogyan érzed magad általában, amikor reggel érkezel?"
    },
    {
      step: 2,
      dimension: 'positive',
      question: "Mesélnél egy közelmúltbeli pillanatról a munkahelyeden, amikor örömet vagy valódi élvezetet éreztél? Kérlek, adj konkrét példát."
    },
    {
      step: 3,
      dimension: 'engagement',
      question: "Írj le egy közelmúltbeli alkalmat, amikor teljesen elmerültél a munkádban—amikor úgy tűnt, mintha elrepült volna az idő."
    },
    {
      step: 4,
      dimension: 'engagement',
      question: "Mennyire érzed, hogy a készségeidet és tehetségedet jól használják jelenlegi szerepedben?"
    },
    {
      step: 5,
      dimension: 'relationships',
      question: "Hogyan jellemeznéd a kapcsolataid minőségét a kollégáiddal? Úgy érzed, vannak emberek, akikre számíthatsz a munkahelyeden?"
    },
    {
      step: 6,
      dimension: 'relationships',
      question: "Úgy érzed, hogy a vezetőd és a csapatod meghallgat és értékel téged?"
    },
    {
      step: 7,
      dimension: 'meaning',
      question: "Milyen módon érzi munkád értelmesnek? Hogyan érzed, hogy hozzájárulsz valami nagyobbhoz?"
    },
    {
      step: 8,
      dimension: 'meaning',
      question: "Összhangban vannak a személyes értékeid a szervezeted értékeivel? Tudsz példát mondani?"
    },
    {
      step: 9,
      dimension: 'accomplishment',
      question: "Melyek azok az eredmények az elmúlt hónapokból, amelyekre a legbüszkébb vagy?"
    },
    {
      step: 10,
      dimension: 'accomplishment',
      question: "Hogyan látod a szakmai fejlődésedet? Úgy érzed, hogy eléred a céljaidat?"
    },
    {
      step: 11,
      dimension: 'work_life_balance',
      question: "Hogyan kezeled az egyensúlyt a munkád és a magánéleted között? Képes vagy kikapcsolódni és feltöltődni?"
    },
    {
      step: 12,
      dimension: 'work_life_balance',
      question: "Végül, van valami, amit szeretnél megváltoztatni a jelenlegi munkahelyzetedet illetően?"
    }
  ]
};

// Language-specific AI instructions
const languageInstructions: Record<SupportedLanguage, string> = {
  en: 'Respond ONLY in English',
  hu: 'Válaszolj CSAK magyarul'
};

// Helper function to validate language
function getSupportedLanguage(lang: string | null): SupportedLanguage {
  if (lang === 'hu' || lang === 'en') {
    return lang;
  }
  return 'en';
}

// Friendly AI scoring function with language support
async function analyzeResponseWithAI(
  response: string, 
  dimension: keyof PermaScores, 
  questionText: string,
  language: SupportedLanguage = 'en'
): Promise<number> {
  try {
    const langInstruction = languageInstructions[language];
    
    // Fetch prompt from database
    const promptTemplate = await getPrompt('happiness_response_scoring');
    
    // Fill in variables
    const prompt = fillPromptVariables(promptTemplate, {
      langInstruction,
      dimension,
      questionText,
      response
    });

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
    
    console.log(`AI Scoring - Dimension: ${dimension}, Score: ${finalScore}`);
    
    return finalScore;
    
  } catch (error) {
    console.error('AI scoring error:', safeErrorInfo(error));
    
    // If prompt loading fails, use fallback scoring
    if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
      console.error('Prompt unavailable, using fallback scoring:', error.message);
    }
    
    const lowerResponse = response.toLowerCase();
    const positiveIndicators = ['good', 'well', 'happy', 'satisfied', 'motivated', 'pleasure', 'team', 'goals', 'progress', 'jó', 'boldog', 'elégedett'];
    const negativeIndicators = ['bad', 'terrible', 'horrible', 'hate', 'impossible', 'never', 'none', 'rossz', 'szörnyű'];
    
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

// Generate personalized advice with language support
async function generatePersonalizedAdvice(
  permaScores: PermaScores, 
  sessionId: string,
  language: SupportedLanguage = 'en'
): Promise<string[]> {
  try {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('message_text, step_number')
      .eq('session_id', sessionId)
      .eq('is_bot_message', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', safeErrorInfo(error));
    }

    const sortedScores = Object.entries(permaScores)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 3);

    const contextResponses = messages && messages.length > 0 
      ? messages.slice(0, 6).map((m: ChatMessage) => m.message_text).join(' ') 
      : '';

    const avgScore = Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length;

    const langInstruction = languageInstructions[language];

    // Prepare formatted scores text
    const permaScoresText = Object.entries(permaScores)
      .map(([dim, score]) => `- ${dim}: ${score}/10`)
      .join('\n');

    const sortedScoresText = sortedScores
      .map(([dim, score]) => `- ${dim}: ${score}/10`)
      .join('\n');

    // Determine tone guidance
    let toneGuidance = '';
    if (avgScore >= 7) {
      toneGuidance = 'Encouraging and optimizing';
    } else if (avgScore >= 5) {
      toneGuidance = 'Supportive and constructive';
    } else {
      toneGuidance = 'Kind and reassuring';
    }

    // Fetch prompt from database
    const promptTemplate = await getPrompt('happiness_personalized_advice');
    
    // Fill in variables
    const prompt = fillPromptVariables(promptTemplate, {
      langInstruction,
      avgScore: avgScore.toFixed(1),
      permaScoresText,
      sortedScoresText,
      contextResponses: contextResponses.substring(0, 400),
      toneGuidance
    });

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

    // Fallback advice by language
    const fallbackAdvice: Record<SupportedLanguage, string[]> = {
      en: [
        "🚀 Keep up the great work! Share your best practices with colleagues",
        "💡 Identify one small thing to improve this week and go for it",
        "🌱 Remember that every small step counts; you're not alone in this journey"
      ],
      hu: [
        "🚀 Folytasd a nagyszerű munkát! Oszd meg a legjobb gyakorlataidat a kollégáiddal",
        "💡 Találj ki egy apró dolgot, amit ezen a héten fejleszthetsz, és próbáld ki",
        "🌱 Ne feledd, minden kis lépés számít; nem vagy egyedül ezen az úton"
      ]
    };

    const defaultFallback = fallbackAdvice[language];

    while (adviceLines.length < 3) {
      const index = adviceLines.length;
      if (avgScore >= 7) {
        adviceLines.push(defaultFallback[0]);
      } else if (avgScore >= 5) {
        adviceLines.push(defaultFallback[1]);
      } else {
        adviceLines.push(defaultFallback[2]);
      }
    }

    console.log('Generated advice, count:', adviceLines.length);
    return adviceLines;

  } catch (error) {
    console.error('Advice generation error:', safeErrorInfo(error));
    
    // If prompt loading fails, provide fallback
    if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
      console.error('Prompt unavailable, using fallback advice:', error.message);
    }
    
    const avgScore = Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length;
    
    // Language-specific fallback messages
    const fallbackMessages: Record<SupportedLanguage, string[][]> = {
      en: [
        [
          "🎯 You're on the right track! Keep nurturing what makes you happy at work",
          "🤝 Share your positive energy with colleagues—it can do wonders",
          "📈 Use this momentum to set a new stimulating challenge"
        ],
        [
          "🌱 Pick one aspect of your work to improve and start small",
          "☕ Take time to chat with colleagues; relationships often make the difference",
          "⏸️ Give yourself real breaks during the day; your brain needs to rest"
        ],
        [
          "🫂 Remember, you are not alone—feel free to share your struggles",
          "🎯 Set very simple goals to gradually regain confidence",
          "🌅 Each new day is a chance to see things differently"
        ]
      ],
      hu: [
        [
          "🎯 Jó úton jársz! Folytasd azt, ami boldoggá tesz a munkahelyeden",
          "🤝 Oszd meg a pozitív energiádat a kollégáiddal—csodákat tehet",
          "📈 Használd ezt a lendületet egy új, ösztönző kihívás kitűzésére"
        ],
        [
          "🌱 Válassz egy területet a munkádból, amit fejleszthetsz, és kezdj kicsiben",
          "☕ Szánj időt a beszélgetésre a kollégáiddal; a kapcsolatok gyakran mindent megváltoztatnak",
          "⏸️ Adj magadnak valódi szüneteket a nap folyamán; az agyadnak pihenésre van szüksége"
        ],
        [
          "🫂 Ne feledd, nem vagy egyedül—bátran oszd meg a nehézségeidet",
          "🎯 Tűzz ki nagyon egyszerű célokat, hogy fokozatosan visszanyerd az önbizalmadat",
          "🌅 Minden új nap lehetőség arra, hogy másképp lásd a dolgokat"
        ]
      ]
    };

    const langFallbacks = fallbackMessages[language];

    if (avgScore >= 7) {
      return langFallbacks[0];
    } else if (avgScore >= 5) {
      return langFallbacks[1];
    } else {
      return langFallbacks[2];
    }
  }
}

// End messages by language
const endMessages: Record<SupportedLanguage, EndMessageSet> = {
  en: {
    excellent: "Fantastic! Your workplace well-being is shining positively. Keep cultivating this great energy! 🌟",
    good: "Very good! You have solid foundations for your professional well-being. A few tweaks can make you shine even more! ✨",
    improvable: "Your situation has good potential for improvement. The tips below will help you reach new heights! 🚀",
    poor: "Thank you for your honesty. Your answers show real challenges, but remember that everything can improve with the right strategies and support. 💙"
  },
  hu: {
    excellent: "Fantasztikus! A munkahelyi jólléted pozitívan ragyog. Folytasd ezt a nagyszerű energiát! 🌟",
    good: "Nagyon jó! Szilárd alapokkal rendelkezel a szakmai jóllétedhez. Néhány apró változtatással még jobban ragyoghatsz! ✨",
    improvable: "A helyzetednek jó fejlődési potenciálja van. Az alábbi tippek segítenek új magasságokat elérni! 🚀",
    poor: "Köszönöm az őszinteségedet. A válaszaid valódi kihívásokat mutatnak, de ne feledd, hogy minden javítható a megfelelő stratégiákkal és támogatással. 💙"
  }
};

const completionMessages: Record<SupportedLanguage, string> = {
  en: `Thank you for sharing your sincere thoughts! 🎉

Your well-being assessment is now complete. Here's a summary of your results:

**Overall workplace well-being score: {score}/10**

{endMessage}

This assessment is completely anonymous and designed to support overall employee well-being within the company.`,
  hu: `Köszönöm, hogy megosztottad őszinte gondolataidat! 🎉

A jólléti felmérésed most befejeződött. Itt van az eredmények összefoglalója:

**Általános munkahelyi jóllét pontszám: {score}/10**

{endMessage}

Ez a felmérés teljesen anonim, és a vállalaton belüli általános munkavállalói jóllét támogatására szolgál.`
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;
    
    const sessionToken = request.headers.get('x-session-token');
    const languageHeader = request.headers.get('x-lang');
    const language = getSupportedLanguage(languageHeader);
    
    console.log('Received language:', language);
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Missing session token' },
        { status: 401 }
      );
    }

    // Get questions for current language
    const permaQuestions = permaQuestionsMap[language];

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
        currentQuestion.question,
        language
      );
      
      permaScores = {
        ...permaScores,
        [currentQuestion.dimension]: score
      };
      
      console.log(`Step ${currentStep}: AI score recorded for dimension ${currentQuestion.dimension}`);
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

      // Generate personalized advice with language support
      personalizedAdvice = await generatePersonalizedAdvice(permaScores, session.id, language);
      console.log('Generated advice in route, count:', personalizedAdvice.length);

      // Get language-specific end messages
      const langEndMessages = endMessages[language];
      let endMessage = "";
      if (avgScore >= 8) {
        endMessage = langEndMessages.excellent;
      } else if (avgScore >= 6.5) {
        endMessage = langEndMessages.good;
      } else if (avgScore >= 5) {
        endMessage = langEndMessages.improvable;
      } else {
        endMessage = langEndMessages.poor;
      }

      const completionTemplate = completionMessages[language];
      response = completionTemplate
        .replace('{score}', (Math.round(avgScore * 10) / 10).toString())
        .replace('{endMessage}', endMessage);
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

    console.log('Session update:', { sessionId: session.id, currentStep, scoreCount: Object.keys(permaScores).length });

    const { error: updateError } = await supabase
      .from('happiness_sessions')
      .update(updateData)
      .eq('session_token', sessionToken);

    if (updateError) {
      console.error('Session update error:', safeErrorInfo(updateError));
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

    console.log('Response sent to frontend:', { step: sessionUpdate.step, completed: sessionUpdate.completed });
    return NextResponse.json(sessionUpdate);

  } catch (error) {
    console.error('Error in POST /api/happiness/chat:', safeErrorInfo(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}