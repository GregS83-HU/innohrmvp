// src/app/cv-analyse/page.tsx

import CVAnalyseClient from './CVAnalyseClient'

interface PageProps {
  searchParams: { [key: string]: string | undefined }
}

export default function CVAnalysePage({ searchParams }: PageProps) {
  const positionName = searchParams.position ?? ''
  const jobDescription = searchParams.description ?? ''

  return (
    <CVAnalyseClient
      positionName={positionName}
      jobDescription={jobDescription}
    />
  )
}