// src/app/jobs/[slug]/page.tsx
import PositionsList from "../../openedpositions/PositionList";

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

type ApiResponse = { positions?: Position[] };

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Votre environnement (Vercel) impose params en Promise -> on l'attend.
  const { slug } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  let positions: Position[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/positions-public?slug=${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Impossible de charger les positions");

    const data: ApiResponse = await res.json();
    positions = data.positions ?? [];
  } catch (err) {
    console.error(err);
  }

  return (
    <main style={{ maxWidth: "900px", margin: "auto", padding: "2rem" }}>
      <PositionsList initialPositions={positions} companySlug={slug} />
    </main>
  );
}
