// src/app/cv-analyse/page.tsx

import CVAnalyseClient from './CVAnalyseClient';

interface SearchParams {
  position?: string | string[];
  description?: string | string[];
  descriptiondetailed?: string | string[];
  id?: string | string[];
}

interface CVAnalysePageProps {
  searchParams?: SearchParams;
}

// ⚠️ Next 15 App Router page must be async
export default async function CVAnalysePage({ searchParams }: CVAnalysePageProps) {
  const positionName = Array.isArray(searchParams?.position)
    ? searchParams.position[0]
    : searchParams?.position ?? '';

  const jobDescription = Array.isArray(searchParams?.description)
    ? searchParams.description[0]
    : searchParams?.description ?? '';

  const jobDescriptionDetailed = Array.isArray(searchParams?.descriptiondetailed)
    ? searchParams.descriptiondetailed[0]
    : searchParams?.descriptiondetailed ?? '';

  const positionId = Array.isArray(searchParams?.id)
    ? searchParams.id[0]
    : searchParams?.id ?? '';

  return (
    <CVAnalyseClient
      positionName={positionName}
      jobDescription={jobDescription}
      jobDescriptionDetailed={jobDescriptionDetailed}
      positionId={positionId}
    />
  );
}
