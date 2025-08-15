// src/app/cv-analyse/page.tsx
import CVAnalyseClient from './CVAnalyseClient';

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

  return (
    <CVAnalyseClient
      positionName={positionName}
      jobDescription={jobDescription}
      jobDescriptionDetailed={jobDescriptionDetailed}
      positionId={positionId}
    />
  );
}
