// app/(ton-dossier)/page.tsx
import { createServerClient } from '../../../lib/supabaseServerClient'
import PositionsList from './PositionList'

export default async function HomePage() {
  const supabase = createServerClient()

  // Jointure pour récupérer aussi le logo
 const { data: positions, error } = await supabase
  .from('OpenedPositions')
  .select(`
    *,
    company:company_id (
      company_logo
    )
  `)



  if (error) {
    console.error(error)
    return <p>Erreur lors du chargement des offres.</p>
  }

  return (
    <main style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h1 className="text-2xl font-bold text-center mb-6">📄 Offres d’emploi ouvertes</h1>
      {positions.length === 0 && <p>Aucune offre disponible.</p>}
      <PositionsList positions={positions} />
    </main>
  )
}