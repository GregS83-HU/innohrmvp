// src/app/cv-analyse/page.tsx
import CVAnalyseClient from './CVAnalyseClient';

interface SearchParams {
  position?: string | string[];
  description?: string | string[];
  descriptiondetailed?: string | string[];
  id?: string | string[];
}

export default function CVAnalysePage({ searchParams }: { searchParams?: SearchParams }) {
  const getFirst = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value ?? '';

  const positionName = getFirst(searchParams?.position);
  const jobDescription = getFirst(searchParams?.description);
  const jobDescriptionDetailed = getFirst(searchParams?.descriptiondetailed);
  const positionId = getFirst(searchParams?.id);

  return (
    <CVAnalyseClient
      positionName={positionName}
      jobDescription={jobDescription}
      jobDescriptionDetailed={jobDescriptionDetailed}
      positionId={positionId}
    />
  );
}
