// src/app/cv-analyse/page.tsx
import CVAnalyseClient from './CVAnalyseClient'

export default async function CVAnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  const positionName = Array.isArray(params.position)
    ? params.position[0]
    : params.position ?? ''

  const jobDescription = Array.isArray(params.description)
    ? params.description[0]
    : params.description ?? ''

  const positionId = Array.isArray(params.id)
    ? params.id[0]
    : params.id ?? '' // ✅ ici

  
  return (
    <CVAnalyseClient
      positionName={positionName}
      jobDescription={jobDescription}
      positionId={positionId} // ✅ bien passé ici
      
    />
  )
}