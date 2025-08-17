import PositionsList, { Position } from "../../openedpositions/PositionList"

export default async function CompanyJobsPage({ params }: any) {
  const slug = params?.slug as string

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
      <h1 className="text-3xl font-bold text-center mb-8">
        Offres d’emploi – {positions[0]?.company?.name || slug}
      </h1>

      <PositionsList initialPositions={positions} companySlug={slug} />
    </main>
  )
}
