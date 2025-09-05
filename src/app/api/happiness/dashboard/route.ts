

// src/app/api/happiness/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    // This endpoint should be protected by your auth system
    // Add your authentication check here
    
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get recent metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('happiness_daily_metrics')
      .select('*')
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: false })

    if (metricsError) {
      console.error('Metrics error:', metricsError)
      return NextResponse.json({ error: 'Erreur récupération métriques' }, { status: 500 })
    }

    // Get current period stats
    const { data: currentStats, error: statsError } = await supabase
      .from('happiness_sessions')
      .select('overall_happiness_score, perma_scores, status, created_at')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed')

    if (statsError) {
      console.error('Stats error:', statsError)
      return NextResponse.json({ error: 'Erreur récupération statistiques' }, { status: 500 })
    }

    // Calculate summary stats
    const totalSessions = currentStats?.length || 0
    const avgHappiness = totalSessions > 0 
      ? currentStats.reduce((sum, s) => sum + (s.overall_happiness_score || 0), 0) / totalSessions
      : 0

    // Calculate PERMA averages
    const permaAverages = totalSessions > 0 ? {
      positive: currentStats.reduce((sum, s) => sum + (s.perma_scores?.positive || 0), 0) / totalSessions,
      engagement: currentStats.reduce((sum, s) => sum + (s.perma_scores?.engagement || 0), 0) / totalSessions,
      relationships: currentStats.reduce((sum, s) => sum + (s.perma_scores?.relationships || 0), 0) / totalSessions,
      meaning: currentStats.reduce((sum, s) => sum + (s.perma_scores?.meaning || 0), 0) / totalSessions,
      accomplishment: currentStats.reduce((sum, s) => sum + (s.perma_scores?.accomplishment || 0), 0) / totalSessions,
      work_life_balance: currentStats.reduce((sum, s) => sum + (s.perma_scores?.work_life_balance || 0), 0) / totalSessions
    } : {}

    // Find areas for improvement (lowest scores)
    const sortedPerma = Object.entries(permaAverages)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 2)

    return NextResponse.json({
      summary: {
        totalSessions,
        avgHappiness: Math.round(avgHappiness * 10) / 10,
        participationTrend: metrics?.length > 1 ? 
          (metrics[0]?.total_sessions_completed || 0) - (metrics[1]?.total_sessions_completed || 0) : 0
      },
      permaAverages,
      areasForImprovement: sortedPerma.map(([key, value]) => ({
        area: key,
        score: Math.round(value * 10) / 10
      })),
      dailyMetrics: metrics || [],
      period: `${days} derniers jours`
    })

  } catch (err) {
    console.error('Dashboard error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}