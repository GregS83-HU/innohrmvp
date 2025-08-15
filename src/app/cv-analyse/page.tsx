// src/app/cv-analyse/page.tsx
import type { PageProps } from 'next';
import CVAnalyseClient from './CVAnalyseClient';

type SearchParams = {
  position?: string | string[];
  description?: string | string[];
  descriptiondetailed?: string | string[];
  id?: string | string[];
};

// On étend PageProps pour typer searchParams correctement
interface CVAnalysePageProps extends PageProps {
  searchParams?: Promise<SearchParams>;
}

export default async function CVAnalysePage({ searchParams }: CVAnalysePageProps) {
  // On attend toujours searchParams (Promise<SearchParams>)
  const params = await searchParams;

  const getFirst = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value ?? '';

  const positionName = getFirst(params?.position);
  const jobDescription = getFirst(params?.description);
  const jobDescriptionDetailed = getFirst(params?.descriptiondetailed);
  const positionId = getFirst(params?.id);

  return (
    <CVAnalyseClient
      positionName={positionName}
      jobDescription={jobDescription}
      jobDescriptionDetailed={jobDescriptionDetailed}
      positionId={positionId}
    />
  );
}
