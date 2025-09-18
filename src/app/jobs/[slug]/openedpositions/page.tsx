// src/app/jobs/[slug]/page.tsx
import PositionsList from "./PositionList";
import { Analytics } from "@vercel/analytics/next"
import { Metadata } from 'next'

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

// Generate dynamic metadata for better SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  return {
    title: `Jobs at ${slug} | Job Board`,
    description: `Browse available positions at ${slug}. Find your next career opportunity.`,
    openGraph: {
      title: `Jobs at ${slug}`,
      description: `Browse available positions at ${slug}`,
    },
  }
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  let positions: Position[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/positions-public?slug=${slug}`, {
      // Use revalidation instead of no-store for better performance
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });
    
    if (!res.ok) {
      console.error('Failed to fetch positions:', res.status, res.statusText);
      // Don't throw here, just use empty array
    } else {
      const data: ApiResponse = await res.json();
      positions = data.positions ?? [];
    }
  } catch (err) {
    console.error('Error fetching positions:', err);
    // Continue with empty array
  }

  return (
    <>
      {/* Remove the main wrapper with fixed max-width and padding */}
      <PositionsList initialPositions={positions} companySlug={slug} />
      <Analytics />
    </>
  );
}