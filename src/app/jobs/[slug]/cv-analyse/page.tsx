// src/app/jobs/[slug]/cv-analyse/page.tsx
import CVAnalyseClient from './CVAnalyseClient';
import { createClient } from '@supabase/supabase-js';
import { Analytics } from "@vercel/analytics/next"
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

type Params = {
  id?: string | string[];
};

type PositionData = {
  id: number;
  position_name: string;
  position_description: string;
  position_description_detailed: string;
  company_id: number;
  company: {
    company_name: string;
    slug: string;
    gdpr_file_url: string | null;
  } | null;
};

// Type pour la réponse brute de Supabase (peut être objet ou tableau)
type SupabaseCompany = {
  company_name: string;
  slug: string;
  gdpr_file_url: string | null;
};

type RawSupabaseResponse = {
  id: number;
  position_name: string;
  position_description: string;
  position_description_detailed: string;
  company_id: number;
  company: SupabaseCompany | SupabaseCompany[] | null;
};

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const positionId = Array.isArray(searchParamsResolved?.id) 
    ? searchParamsResolved.id[0] 
    : searchParamsResolved?.id;

  if (positionId) {
    try {
      const position = await fetchPositionData(positionId, slug);
      if (position) {
        return {
          title: `Apply for ${position.position_name} | ${position.company?.company_name || slug}`,
          description: `Apply for the ${position.position_name} position. ${position.position_description}`,
          openGraph: {
            title: `Apply for ${position.position_name}`,
            description: position.position_description,
          },
        };
      }
    } catch (error) {
      console.error('Error generating metadata:', error);
    }
  }

  return {
    title: `Apply for Position | ${slug}`,
    description: `Submit your CV for analysis and application.`,
  };
}

// Cached data fetching function
async function fetchPositionData(positionId: string, companySlug: string): Promise<PositionData | null> {
  try {
    //console.log('Fetching position data for:', { positionId, companySlug });

    // Single query with join to get all needed data
    const { data: position, error } = await supabase
      .from('openedpositions')
      .select(`
        id,
        position_name,
        position_description,
        position_description_detailed,
        company_id,
        company:company_id (
          company_name,
          slug,
          gdpr_file_url
        )
      `)
      .eq('id', positionId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    //console.log('Raw position data:', position);

    // Cast to our raw response type to handle TypeScript properly
    const rawPosition = position as RawSupabaseResponse;

    // Normalize company data - handle both object and array cases
    let company: SupabaseCompany | null = null;
    
    if (rawPosition.company) {
      if (Array.isArray(rawPosition.company)) {
        // If it's an array, take the first element
        company = rawPosition.company.length > 0 ? rawPosition.company[0] : null;
      } else {
        // If it's an object, use it directly
        company = rawPosition.company;
      }
    }


    // Return the properly typed data
    const transformedPosition: PositionData = {
      id: rawPosition.id,
      position_name: rawPosition.position_name,
      position_description: rawPosition.position_description,
      position_description_detailed: rawPosition.position_description_detailed,
      company_id: rawPosition.company_id,
      company: company
    };

    return transformedPosition;
  } catch (error) {
    console.error('Error fetching position data:', error);
    return null;
  }
}

export default async function CVAnalysePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Params>;
}) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  
  const positionId = Array.isArray(searchParamsResolved?.id) 
    ? searchParamsResolved.id[0] 
    : searchParamsResolved?.id;

  // If no position ID provided, show error
  if (!positionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Invalid Application Link</h1>
          <p className="text-gray-600 mb-4">
            The application link appears to be incomplete or invalid.
          </p>
          <a
            href={`/jobs/${slug}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Positions
          </a>
        </div>
      </div>
    );
  }

  // Fetch position data with caching
  const position = await fetchPositionData(positionId, slug);

  // If position not found or doesn't belong to company, show error
  if (!position) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Position Not Found</h1>
          <p className="text-gray-600 mb-4">
            The position you&apos;re trying to apply for doesn&apos;t exist or is no longer available.
          </p>
          <a
            href={`/jobs/${slug}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Positions
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <CVAnalyseClient
        positionName={position.position_name}
        jobDescription={position.position_description}
        jobDescriptionDetailed={position.position_description_detailed}
        positionId={position.id.toString()}
        gdpr_file_url={position.company?.gdpr_file_url || ''}
        companyName={position.company?.company_name || ''}
      />
      <Analytics />
    </>
  );
}

// Add this to your Next.js config for ISR caching
export const revalidate = 300; // Revalidate every 5 minutes