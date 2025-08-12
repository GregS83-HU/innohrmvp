import { createServerClient } from '../../../lib/supabaseServerClient'
import { cookies } from 'next/headers'


type Candidat = {
  id: number
  candidat_firstname: string
  candidat_lastname: string
  cv_text: string
  cv_file: string
}

type PositionToCandidatRow = {
  candidat_score: number | null
  candidats: Candidat[] | null
}


export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ positionId?: string }>
}) {
  // On await la promesse ici
  const params = await searchParams
  const positionId = params.positionId

 // const params = await searchParams
 // const positionId = params.positionId
 //const positionId = searchParams.positionId

  if (!positionId) {
    return <p>Identifiant de la position manquant.</p>
  }

  console.log('positionid=', positionId)

 const supabase = createServerClient()



 const { data, error } = await supabase
  .from('position_to_candidat')
  .select(`
    candidat_score,
    candidat_id,
    candidats:candidat_id (
      candidat_firstname,
      candidat_lastname,
      cv_text,
      cv_file
    )
  `)
  .eq('position_id', Number(positionId)) as {data : PositionToCandidatRow[] | null, error: unknown}
//console.log({ data, error });
//console.dir(data, { depth: null }) // ou
console.log('This is the JSON answer',JSON.stringify(data, null, 2))

//const rows = data as Row[];



  if (error) {
    console.error(error)
    return <p>Error in the loading of the stats.</p>
  }

  if (!data || data.length === 0) {
    return <p>No candidate for this position</p>
  }

  return (
    <main style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h1 className="text-2xl font-bold text-center mb-6">📊 Candidats Statistics</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>First name</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Last Name</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Score</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>CV</th>
          </tr>
        </thead>
        <tbody>
  {data.map((row, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidat = row.candidats as any;  // désactive ESLint pour ce cast
    const isLowScore = row.candidat_score !== null && row.candidat_score <=5;

    const badgeStyle = {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '12px',
      backgroundColor: isLowScore ? '#f8d7da' : '#d4edda', // rouge clair ou vert clair
      color: isLowScore ? 'red' : 'green',
      fontWeight: 'bold' as const,
    };

    return (
      <tr key={index}>
        <td>{candidat?.candidat_firstname ?? '—'}</td>
        <td>{candidat?.candidat_lastname ?? '—'}</td>
        <td>
          <span style={badgeStyle}>
            {row.candidat_score ?? '—'}
          </span>
        </td>

        <td>
          {candidat?.cv_file ? (
            <a
              href={candidat.cv_file}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0070f3' }}
            >
              See the CV
            </a>
          ) : (
            '—'
          )}
        </td>
      </tr>
    )
  })}
</tbody>
      </table>
    </main>
  )
}