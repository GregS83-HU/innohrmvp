import { createClient } from '../../../lib/supabaseClient'
import { cookies } from 'next/headers'


type Candidat = {
  id: number
  candidat_firstname: string | null
  candidat_lastname: string | null
  CV: string | null
}

type PositionToCandidatRow = {
  candidat_score: number | null
  candidats: Candidat[] | null
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: { positionId?: string }
}) {

  const params = await searchParams
  const positionId = params.positionId

  if (!positionId) {
    return <p>Identifiant de la position manquant.</p>
  }

  const supabase = createClient(cookies())

  const { data, error } = await supabase
    .from('position_to_candidat')
    .select(`
      candidat_score,
      candidats (
        id,
        candidat_firstname,
        candidat_lastname,
        CV
      )
    `)
    .eq('position_id', Number(positionId))

  if (error) {
    console.error(error)
    return <p>Erreur lors du chargement des statistiques.</p>
  }

  if (!data || data.length === 0) {
    return <p>Aucun candidat pour ce poste.</p>
  }

  return (
    <main style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h1>📊 Statistiques des candidats</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Prénom</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Nom</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Score</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>CV</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.candidats?.[0]?.candidat_firstname ?? '—'}</td>
              <td>{row.candidats?.[0]?.candidat_lastname ?? '—'}</td>
              <td>{row.candidat_score ?? '—'}</td>
              <td>
                {row.candidats?.[0]?.CV ? (
                  <a
                    href={row.candidats[0].CV}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0070f3' }}
                  >
                    Voir le CV
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}