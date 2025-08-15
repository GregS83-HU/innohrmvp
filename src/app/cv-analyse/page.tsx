// src/app/cv-analyse/page.tsx
import CVAnalyseClient from './CVAnalyseClient';

type SearchParams = {
  position?: string | string[];
  description?: string | string[];
  descriptiondetailed?: string | string[];
  id?: string | string[];
};

interface CVAnalysePageProps {
  searchParams?: SearchParams | Promise<SearchParams>;
}

export default async function CVAnalysePage({ searchParams }: CVAnalysePageProps) {
  // Si searchParams est un Promise (cas Vercel/Next.js strict)
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams;

  const getFirst = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value ?? '';

  const positionName = getFirst(resolvedParams?.position);
  const jobDescription = getFirst(resolvedParams?.description);
  const jobDescriptionDetailed = getFirst(resolvedParams?.descriptiondetailed);
  const positionId = getFirst(resolvedParams?.id);

  return (
    <CVAnalyseClient
      positionName={positionName}
      jobDescription={jobDescription}
      jobDescriptionDetailed={jobDescriptionDetailed}
      positionId={positionId}
    />
  );
}
