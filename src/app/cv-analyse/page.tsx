// src/app/cv-analyse/page.tsx
import CVAnalyseClient from './CVAnalyseClient'

export default async function CVAnalysePage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const positionName = Array.isArray(searchParams.position) ? searchParams.position[0] : searchParams.position ?? ''
  const jobDescription = Array.isArray(searchParams.description) ? searchParams.description[0] : searchParams.description ?? ''

  return (
    <CVAnalyseClient
      positionName={positionName}
      jobDescription={jobDescription}
    />
  )
}