import PositionsList from "app/openedpositions/PositionList"
type Position = {
  id: number
  position_name: string
  position_description: string
  position_description_detailed: string
  company?: {
    company_logo?: string
    company_name?: string
    slug?: string
  }
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function CompanyJobsPage({ params }: Props) {
  // ✅ Attendre params (Next.js App Router)
  const { slug } = await params

  // ✅ URL absolue côté serveur
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/positions-public?slug=${slug}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Impossible de charger les positions")
  }

  const data = await res.json()
  const positions: Position[] = data.positions || []
  return (
    <main style={{ maxWidth: "900px", margin: "auto", padding: "2rem" }}>

      {/* ✅ Réutilisation du composant avec bouton Apply */}
      <PositionsList initialPositions={positions} companySlug={slug} />
    </main>
  )
}