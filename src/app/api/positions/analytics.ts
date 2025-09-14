// app/api/positions/analytics/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CandidatData {
  candidat_firstname?: string;
  candidat_lastname?: string;
}

interface PositionToCandidatItem {
  created_at: string;
  candidat_score: number | null;
  source: string;
  candidats: CandidatData | null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const position_id = url.searchParams.get('position_id')
  const user_id = url.searchParams.get('user_id')
  const period = url.searchParams.get('period')

  if (!position_id) {
    return new Response(JSON.stringify({ error: 'position_id requis' }), { status: 400 })
  }
  if (!user_id) {
    return new Response(JSON.stringify({ error: 'user_id requis' }), { status: 400 })
  }

  try {
    // Vérifier que la position existe
    const { data: position, error: posErr } = await supabase
      .from('openedpositions')
      .select('*')
      .eq('id', position_id)
      .single()

    if (posErr || !position) {
      return new Response(JSON.stringify({ error: 'Position non trouvée' }), { status: 404 })
    }

    // Construire la requête pour les candidats de cette position
    let query = supabase
      .from('position_to_candidat')
      .select(`
        created_at,
        candidat_score,
        source,
        candidats (
          candidat_firstname,
          candidat_lastname
        )
      `)
      .eq('position_id', position_id)

    // Appliquer le filtre temporel si spécifié
    if (period && period !== 'all') {
      const days = parseInt(period.replace('d', ''))
      if (!isNaN(days)) {
        const filterDate = new Date()
        filterDate.setDate(filterDate.getDate() - days)
        query = query.gte('created_at', filterDate.toISOString())
      }
    }

    const { data: candidateData, error: candidateError } = await query

    if (candidateError) {
      console.error('Erreur lors de la récupération des candidats:', candidateError)
      return new Response(JSON.stringify({ error: 'Erreur lors de la récupération des candidats' }), { status: 500 })
    }

    // Formater les données avec typage correct
    const formattedCandidates = (candidateData as PositionToCandidatItem[])?.map(item => ({
      created_at: item.created_at,
      candidat_score: item.candidat_score,
      source: item.source || 'upload manuel',
      candidat_firstname: item.candidats?.candidat_firstname || '',
      candidat_lastname: item.candidats?.candidat_lastname || ''
    })) || []

    return new Response(JSON.stringify({ 
      candidates: formattedCandidates,
      position: position
    }), { status: 200 })

  } catch (err) {
    console.error('Erreur API:', err)
    return new Response(JSON.stringify({ error: 'Erreur serveur interne' }), { status: 500 })
  }
}