import Link from 'next/link'
import { createServerClient } from '../../../lib/supabaseServerClient' // import serveur

export default async function HomePage() {
  const supabase = createServerClient() // crée le client côté serveur avec cookies

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: positions, error } = await supabase
    .from('OpenedPositions')
    .select('*')

  if (error) {
    console.error(error)
    return <p>Erreur lors du chargement des offres.</p>
  }

  const isLoggedIn = !!session?.user

  return (
    <main style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h1 className="text-2xl font-bold text-center mb-6">📄 Offres d’emploi ouvertes</h1>
      {positions.length === 0 && <p>Aucune offre disponible.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {positions.map((position) => (
          <li
            key={position.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '6px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h2>{position.position_name}</h2>
            <p>{position.position_description}</p>
            <Link
              href={`/cv-analyse?position=${encodeURIComponent(
                position.position_name
              )}&description=${encodeURIComponent(
                position.position_description
              )}&id=${position.id}`}
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                textDecoration: 'none',
              }}
            >
              📝 Postuler
            </Link>

            
              <Link
                href={`/stats?positionId=${position.id}`}
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  marginLeft: '0.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  textDecoration: 'none',
                }}
              >
                📊 Stats
              </Link>
          
          </li>
        ))}
      </ul>
    </main>
  )
}