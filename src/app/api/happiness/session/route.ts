// src/app/api/happiness/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes, createHash } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + process.env.IP_SALT || 'default_salt').digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { company_id } = body // Extract company_id from request body
    
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const sessionToken = generateSessionToken()
    const ipHash = hashIP(ip)
    const userAgentHash = hashIP(userAgent)

    // Check for recent sessions from same IP (optional cooldown)
    const { data: recentSessions } = await supabase
      .from('happiness_sessions')
      .select('created_at')
      .eq('ip_hash', ipHash)
      //.gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // 2 hours cooldown
      .gte('created_at', new Date(Date.now()).toISOString())
      .eq('status', 'completed')

    if (recentSessions && recentSessions.length > 0) {
      return NextResponse.json({
        error: 'Une évaluation récente a déjà été effectuée. Merci de réessayer plus tard.'
      }, { status: 429 })
    }

    // Prepare session data
    const sessionData: any = {
      session_token: sessionToken,
      ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      status: 'created'
    }

    // Add company_id if provided
    if (company_id) {
      sessionData.company_id = company_id
    }

    const { data: session, error } = await supabase
      .from('happiness_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('Session creation error:', error)
      return NextResponse.json({ error: 'Erreur création session' }, { status: 500 })
    }

    return NextResponse.json({
      sessionToken,
      sessionId: session.id,
      message: 'Session créée avec succès',
      company_id: session.company_id // Return company_id in response for confirmation
    })

  } catch (err) {
    console.error('Session creation error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.headers.get('x-session-token')
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Token session requis' }, { status: 401 })
    }

    const { data: session, error } = await supabase
      .from('happiness_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    // Check if session is expired
    if (new Date() > new Date(session.timeout_at)) {
      await supabase
        .from('happiness_sessions')
        .update({ status: 'timeout' })
        .eq('session_token', sessionToken)
      
      return NextResponse.json({ error: 'Session expirée' }, { status: 410 })
    }

    return NextResponse.json({ session })

  } catch (err) {
    console.error('Session retrieval error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}