import PositionsList from "app/openedpositions/PositionList";

type Position = {
  id: number;
  position_name: string;
  position_description: string;
  position_description_detailed: string;
  company?: {
    company_logo?: string;
    company_name?: string;
    slug?: string;
  };
};

type Props = {
  params: { slug: string };
};

export default async function Page({ params }: Props) {
  const { slug } = params;

  // ✅ URL côté serveur (Next.js App Router)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/positions-public?slug=${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Erreur fetch positions:", res.statusText);
      return <div>Impossible de charger les positions.</div>;
    }

    const data = await res.json();
    const positions: Position[] = data.positions || [];

    return (
      <main style={{ maxWidth: "900px", margin: "auto", padding: "2rem" }}>

        <PositionsList initialPositions={positions} companySlug={slug} />
      </main>
    );
  } catch (error) {
    console.error("Erreur page /jobs/[slug]:", error);
    return <div>Une erreur est survenue.</div>;
  }
}
