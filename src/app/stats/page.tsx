import { createServerClient } from '../../../lib/supabaseServerClient'
import StatsTable from './StatsTable'

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ positionId?: string }> }) {
  const params = await searchParams
  const positionId = params.positionId

  if (!positionId) return <p>Identifiant de la position manquant.</p>

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('position_to_candidat')
    .select(`
      candidat_score,
      candidat_id,
      candidat_comment,
      candidats:candidat_id (
        candidat_firstname,
        candidat_lastname,
        cv_text,
        cv_file
      )
    `)
    .eq('position_id', Number(positionId))

  if (error) return <p>Error in the loading of the stats.</p>
  if (!data || data.length === 0) return <p>No candidate for this position</p>

  return (
    <main style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h1 className="text-2xl font-bold text-center mb-6">📊 Candidats Statistics</h1>
      <StatsTable rows={data} />
    </main>
  )
}
