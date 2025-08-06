// src/app/cv-analyse/page.tsx
// Pas de 'use client' ici — c'est un Server Component

import CVAnalyseClient from './CVAnalyseClient'

export default function CVAnalysePage({ searchParams }: { searchParams: URLSearchParams }) {
  const jobDescription = searchParams.get('description') ?? ''
  const positionName = searchParams.get('position') ?? ''

  return <CVAnalyseClient jobDescription={jobDescription} positionName={positionName} />
}