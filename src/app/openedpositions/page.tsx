// app/(ton-dossier)/page.tsx
import { createServerClient } from '../../../lib/supabaseServerClient'
import PositionsList from './PositionList'

export default async function HomePage() {
  const supabase = createServerClient()

  // Récupérer la session (pour savoir si un utilisateur est connecté)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let positions = []

  if (!session) {
    // Pas connecté → toutes les positions
    const { data, error } = await supabase
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
    positions = data || []
  } else {
    // Connecté → récupérer company_id de l'utilisateur
    const { data: companyLink, error: companyError } = await supabase
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', session.user.id)
      .single()

    if (companyError || !companyLink) {
      console.error(companyError)
      return <p>Erreur lors de la récupération de l’entreprise.</p>
    }

    const companyId = companyLink.company_id

    // Récupérer tous les utilisateurs de la même entreprise
    const { data: companyUsers, error: usersError } = await supabase
      .from('company_to_users')
      .select('user_id')
      .eq('company_id', companyId)

    if (usersError) {
      console.error(usersError)
      return <p>Erreur lors du chargement des utilisateurs de l’entreprise.</p>
    }

    const userIds = companyUsers.map((u) => u.user_id)

    // Récupérer les positions créées par ces utilisateurs
    const { data, error: positionsError } = await supabase
      .from('OpenedPositions')
      .select(`
        *,
        company:company_id (
          company_logo
        )
      `)
      .in('user_id', userIds)

    if (positionsError) {
      console.error(positionsError)
      return <p>Erreur lors du chargement des offres.</p>
    }

    positions = data || []
  }

  return (
    <main style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h1 className="text-2xl font-bold text-center mb-6">
        📄 Offres d’emploi ouvertes
      </h1>
      {positions.length === 0 && <p>Aucune offre disponible.</p>}
      <PositionsList positions={positions} />
    </main>
  )
}
