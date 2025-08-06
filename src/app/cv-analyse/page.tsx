import CVAnalyseClient from './CVAnalyseClient'

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default function CVAnalysePage({ searchParams }: PageProps) {
  const jobDescription = typeof searchParams.description === 'string' ? searchParams.description : ''
  const positionName = typeof searchParams.position === 'string' ? searchParams.position : ''

  return <CVAnalyseClient jobDescription={jobDescription} positionName={positionName} />
}