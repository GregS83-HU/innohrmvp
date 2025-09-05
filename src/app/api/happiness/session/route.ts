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
  // Correction: Utilisation d'un import ES6 au lieu de require()
  return createHash('sha256').update(ip + process.env.IP_SALT || 'default_salt').digest('hex')
}

export async function POST(req: NextRequest) {
  try {
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
      .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // 2 hours cooldown
      .eq('status', 'completed')

    if (recentSessions && recentSessions.length > 0) {
      return NextResponse.json({ 
        error: 'Une évaluation récente a déjà été effectuée. Merci de réessayer plus tard.' 
      }, { status: 429 })
    }

    const { data: session, error } = await supabase
      .from('happiness_sessions')
      .insert({
        session_token: sessionToken,
        ip_hash: ipHash,
        user_agent_hash: userAgentHash,
        status: 'created'
      })
      .select()
      .single()

    if (error) {
      console.error('Session creation error:', error)
      return NextResponse.json({ error: 'Erreur création session' }, { status: 500 })
    }

    return NextResponse.json({ 
      sessionToken,
      sessionId: session.id,
      message: 'Session créée avec succès' 
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