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

// [slug]/page.tsx
interface PageParams {
  params: { slug: string };
}

export default async function Page({ params }: PageParams) {
  const slug = params.slug;

  // ✅ URL absolue côté serveur (Vercel ou local)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let positions: Position[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/positions-public?slug=${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Impossible de charger les positions");
    }

    const data = await res.json();
    positions = data.positions || [];
  } catch (err) {
    console.error("Erreur récupération positions:", err);
  }

  return (
    <main style={{ maxWidth: "900px", margin: "auto", padding: "2rem" }}>
      <h1 className="text-3xl font-bold text-center mb-8">
        Offres d’emploi – {positions[0]?.company?.company_name || slug}
      </h1>

      <PositionsList initialPositions={positions} companySlug={slug} />
    </main>
  );
}
