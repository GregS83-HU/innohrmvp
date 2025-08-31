// src/app/cv-analyse/page.tsx
import CVAnalyseClient from './CVAnalyseClient';
import { createClient } from '@supabase/supabase-js';

// ⚠️ on crée un client supabase côté serveur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string // clé service côté serveur
);

type Params = {
  position?: string | string[];
  description?: string | string[];
  descriptiondetailed?: string | string[];
  id?: string | string[];
};

export default async function CVAnalysePage({
  searchParams,
}: {
  searchParams?: Promise<Params>;
}) {
  // Compatible local (objet direct) et Vercel (Promise)
  const params = await searchParams;

  const getFirst = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value ?? '';

  const positionName = getFirst(params?.position);
  const jobDescription = getFirst(params?.description);
  const jobDescriptionDetailed = getFirst(params?.descriptiondetailed);
  const positionId = getFirst(params?.id);

  // 🟦 On va chercher l’URL GDPR depuis la company associée
  let gdprUrl = '';
  if (positionId) {
    // 1. Récupérer la position avec son company_id
    const { data: position, error: posError } = await supabase
      .from('openedpositions')
      .select('company_id')
      .eq('id', positionId)
      .single();

    if (!posError && position?.company_id) {
      // 2. Récupérer la company et son gdpr_file_url
      const { data: company, error: compError } = await supabase
        .from('company')
        .select('gdpr_file_url')
        .eq('id', position.company_id)
        .single();

      if (!compError && company?.gdpr_file_url) {
        gdprUrl = company.gdpr_file_url;
      }
    }
  }

  console.log("GDPR URL:", gdprUrl)
  return (
    <CVAnalyseClient
      positionName={positionName}
      jobDescription={jobDescription}
      jobDescriptionDetailed={jobDescriptionDetailed}
      positionId={positionId}
      gdpr_file_url={gdprUrl} // 👈 on passe bien le lien GDPR
    />
  );
}
