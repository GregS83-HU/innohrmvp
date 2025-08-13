import { createServerClient } from '../../../lib/supabaseServerClient'
import StatsTable from './StatsTable'

type Candidat = {
  candidat_firstname: string
  candidat_lastname: string
  cv_text: string
  cv_file: string
}

type PositionToCandidatRow = {
  candidat_score: number | null
  candidat_id: number
  candidat_comment: string | null
  candidat_next_step: string | null
  candidats: Candidat | null
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ positionId?: string }>
}) {
  const params = await searchParams
  const positionId = params.positionId

  if (!positionId) {
    return <p>Identifiant de la position manquant.</p>
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('position_to_candidat')
    .select(`
      candidat_score,
      candidat_id,
      candidat_comment,
      candidat_next_step,
      candidats (
        candidat_firstname,
        candidat_lastname,
        cv_text,
        cv_file
      )
    `)
    .eq('position_id', Number(positionId)) as {
      data: PositionToCandidatRow[] | null
      error: unknown
    }

  if (error) {
    console.error(error)
    return <p>Error in the loading of the stats.</p>
  }

  if (!data || data.length === 0) {
    return <p>No candidate for this position</p>
  }

  return (
    <main style={{ maxWidth: '900px', margin: 'auto', padding: '2rem' }}>
      <h1 className="text-2xl font-bold text-center mb-6">
        📊 Candidats Statistics
      </h1>
      <StatsTable rows={data} />
    </main>
  )
}
