// src/app/api/happiness/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Types
interface PermaScores {
  positive?: number;
  engagement?: number;
  relationships?: number;
  meaning?: number;
  accomplishment?: number;
  work_life_balance?: number;
}

interface HappinessSession {
  overall_happiness_score: number | null;
  perma_scores: PermaScores | null;
  status: string;
  created_at: string;
}

interface DailyMetric {
  metric_date: string;
  total_sessions_completed: number;
  avg_happiness_score: number;
  [key: string]: string | number;
}

interface AreaForImprovement {
  area: string;
  score: number;
}

type SupportedLanguage = 'en' | 'hu';

// Helper function to validate language
function getSupportedLanguage(lang: string | null): SupportedLanguage {
  if (lang === 'hu' || lang === 'en') {
    return lang;
  }
  return 'en';
}

// Translation messages
const messages: Record<SupportedLanguage, {
  errors: {
    missingUserId: string;
    metricsError: string;
    statsError: string;
    serverError: string;
  };
  period: string;
}> = {
  en: {
    errors: {
      missingUserId: 'Missing user_id',
      metricsError: 'Error retrieving metrics',
      statsError: 'Error retrieving statistics',
      serverError: 'Server error'
    },
    period: 'last {days} days'
  },
  hu: {
    errors: {
      missingUserId: 'Hiányzó user_id',
      metricsError: 'Hiba a metrikák lekérésekor',
      statsError: 'Hiba a statisztikák lekérésekor',
      serverError: 'Szerver hiba'
    },
    period: 'utolsó {days} nap'
  }
};

export async function GET(req: NextRequest) {
  try {
    // Get language from header
    const languageHeader = req.headers.get('x-lang');
    const language = getSupportedLanguage(languageHeader);
    const t = messages[language];
    
    console.log('Dashboard API - Received language:', language);
    
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '30', 10)
    const user_id = url.searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: t.errors.missingUserId }, 
        { status: 400 }
      )
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Get company_id from user
    const { data: company, error: companyError } = await supabase
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', user_id)
      .single()

    if (companyError) {
      console.error('Company error:', companyError)
    }

    // Get recent metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('happiness_daily_metrics')
      .select('*')
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: false })

    if (metricsError) {
      console.error('Metrics error:', metricsError)
      return NextResponse.json(
        { error: t.errors.metricsError }, 
        { status: 500 }
      )
    }

    // Get current period stats
    const { data: currentStats, error: statsError } = await supabase
      .from('happiness_sessions')
      .select('overall_happiness_score, perma_scores, status, created_at')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed')

    if (statsError) {
      console.error('Stats error:', statsError)
      return NextResponse.json(
        { error: t.errors.statsError }, 
        { status: 500 }
      )
    }

    const typedStats = (currentStats || []) as HappinessSession[];
    const typedMetrics = (metrics || []) as DailyMetric[];

    // Calculate summary stats
    const totalSessions = typedStats.length
    const avgHappiness = totalSessions > 0 
      ? typedStats.reduce((sum, s) => sum + (s.overall_happiness_score || 0), 0) / totalSessions
      : 0

    // Calculate PERMA averages
    const permaAverages: PermaScores = totalSessions > 0 ? {
      positive: typedStats.reduce((sum, s) => sum + (s.perma_scores?.positive || 0), 0) / totalSessions,
      engagement: typedStats.reduce((sum, s) => sum + (s.perma_scores?.engagement || 0), 0) / totalSessions,
      relationships: typedStats.reduce((sum, s) => sum + (s.perma_scores?.relationships || 0), 0) / totalSessions,
      meaning: typedStats.reduce((sum, s) => sum + (s.perma_scores?.meaning || 0), 0) / totalSessions,
      accomplishment: typedStats.reduce((sum, s) => sum + (s.perma_scores?.accomplishment || 0), 0) / totalSessions,
      work_life_balance: typedStats.reduce((sum, s) => sum + (s.perma_scores?.work_life_balance || 0), 0) / totalSessions
    } : {}

    // Find areas for improvement (lowest scores)
    const sortedPerma = Object.entries(permaAverages)
      .sort(([, a], [, b]) => (a || 0) - (b || 0))
      .slice(0, 2)

    const areasForImprovement: AreaForImprovement[] = sortedPerma.map(([key, value]) => ({
      area: key,
      score: Math.round((value || 0) * 10) / 10
    }))

    const periodText = t.period.replace('{days}', days.toString())

    return NextResponse.json({
      summary: {
        totalSessions,
        avgHappiness: Math.round(avgHappiness * 10) / 10,
        participationTrend: typedMetrics.length > 1 ? 
          (typedMetrics[0]?.total_sessions_completed || 0) - (typedMetrics[1]?.total_sessions_completed || 0) : 0
      },
      permaAverages,
      areasForImprovement,
      dailyMetrics: typedMetrics,
      period: periodText
    })

  } catch (err) {
    console.error('Dashboard error:', err)
    const languageHeader = req.headers.get('x-lang');
    const language = getSupportedLanguage(languageHeader);
    const t = messages[language];
    
    return NextResponse.json(
      { error: t.errors.serverError }, 
      { status: 500 }
    )
  }
}