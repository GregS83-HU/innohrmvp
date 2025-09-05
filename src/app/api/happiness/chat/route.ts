// src/app/api/happiness/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PERMA_QUESTIONS = [
  {
    category: 'positive',
    question: "On a scale from 1 to 10, how much do you experience positive emotions at work? (joy, satisfaction, pride in your daily tasks)",
    followup: "What brings you the most satisfaction in your work right now?"
  },
  {
    category: 'engagement',
    question: "To what extent do you feel engaged and absorbed in your professional tasks? (1 = never in flow, 10 = fully absorbed)",
    followup: "In which types of tasks do you lose track of time?"
  },
  {
    category: 'relationships',
    question: "How would you rate the quality of your relationships with your colleagues and your team? (1 = isolated, 10 = excellent cohesion)",
    followup: "What could improve the atmosphere in your team?"
  },
  {
    category: 'meaning',
    question: "To what extent do you find meaning and purpose in your work? (1 = no meaning, 10 = very meaningful)",
    followup: "What would make your work feel more meaningful?"
  },
  {
    category: 'accomplishment',
    question: "How would you evaluate your accomplishments and sense of achievement at work? (1 = no accomplishment, 10 = very proud of my achievements)",
    followup: "What type of recognition would motivate you the most?"
  },
  {
    category: 'work_life_balance',
    question: "How would you rate your work-life balance? (1 = very unbalanced, 10 = perfect balance)",
    followup: "What would help you better balance your professional and personal life?"
  }
]

async function generateAIResponse(sessionData: any, userMessage: string, step: number) {
  const prompt = `You are a supportive workplace wellbeing assistant conducting an anonymous happiness assessment.

Current conversation context:
- Step: ${step} of 12
- User's current scores so far: ${JSON.stringify(sessionData.perma_scores || {})}
- Latest user message: "${userMessage}"

Your role:
1. If step <= 6: Ask the next PERMA question naturally and conversationally
2. If step 7-9: Ask follow-up questions for lowest scoring areas
3. If step 10-12: Provide personalized recommendations

Questions to ask (in order):
${PERMA_QUESTIONS.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}

Guidelines:
- Be empathetic and supportive
- Keep responses under 100 words
- If user provides a score (1-10), acknowledge it warmly
- Never be clinical or robotic
- End questions with encouragement

Respond in English with a warm, professional tone.`

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct',
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const completion = await res.json()
  return completion.choices?.[0]?.message?.content ?? "I'm sorry, there is an error somewhere..."
}

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.headers.get('x-session-token')
    const { message } = await req.json()

    if (!sessionToken || !message) {
      return NextResponse.json({ error: 'Token session et message requis' }, { status: 400 })
    }

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('happiness_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    // Update last activity
    await supabase
      .from('happiness_sessions')
      .update({ 
        last_activity: new Date().toISOString(),
        status: 'in_progress'
      })
      .eq('session_token', sessionToken)

    // Store user message
    await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        message_text: message,
        is_bot_message: false,
        step_number: session.current_step
      })

    // Extract score if present
    const scoreMatch = message.match(/(?:^|\s)([1-9]|10)(?:\s|$)/)
    let extractedScore = null
    let currentCategory = null

    if (scoreMatch && session.current_step <= 6) {
      extractedScore = parseInt(scoreMatch[1])
      currentCategory = PERMA_QUESTIONS[session.current_step - 1]?.category
    }

    // Update session with score
    let updatedPermaScores = session.perma_scores || {}
    if (extractedScore && currentCategory) {
      updatedPermaScores[currentCategory] = extractedScore
      
      await supabase
        .from('happiness_sessions')
        .update({ perma_scores: updatedPermaScores })
        .eq('session_token', sessionToken)
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(
      { ...session, perma_scores: updatedPermaScores }, 
      message, 
      session.current_step + 1
    )

    // Determine message type
    let messageType = 'question'
    if (session.current_step >= 10) messageType = 'recommendation'
    else if (session.current_step >= 7) messageType = 'followup'

    // Store AI response
    await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        message_text: aiResponse,
        is_bot_message: true,
        message_type: messageType,
        step_number: session.current_step + 1,
        score_value: extractedScore,
        perma_category: currentCategory
      })

    // Update session step
    const newStep = session.current_step + 1
    let sessionUpdate: any = { current_step: newStep }

    // Complete session if finished
    if (newStep >= 12) {
      const scores = Object.values(updatedPermaScores) as number[]
      const avgScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0
      sessionUpdate.status = 'completed'
      sessionUpdate.completed_at = new Date().toISOString()
      sessionUpdate.overall_happiness_score = Math.round(avgScore)
    }

    await supabase
      .from('happiness_sessions')
      .update(sessionUpdate)
      .eq('session_token', sessionToken)

    return NextResponse.json({ 
      response: aiResponse,
      step: newStep,
      completed: newStep >= 12,
      scores: updatedPermaScores
    })

  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}