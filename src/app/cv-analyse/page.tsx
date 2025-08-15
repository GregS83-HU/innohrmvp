// ✅ On enlève toute dépendance à un type PageProps global
// ✅ On définit notre propre type local

import CVAnalyseClient from './CVAnalyseClient'

type SearchParams = { [key: string]: string | string[] | undefined }

interface Props {
  searchParams: SearchParams
}

export default function CVAnalysePage({ searchParams }: Props) {
  const positionName = Array.isArray(searchParams.position)
    ? searchParams.position[0]
    : searchParams.position ?? ''

  const jobDescription = Array.isArray(searchParams.description)
    ? searchParams.description[0]
    : searchParams.description ?? ''

  const jobDescriptionDetailed = Array.isArray(searchParams.descriptiondetailed)
    ? searchParams.descriptiondetailed[0]
    : searchParams.descriptiondetailed ?? ''

  const positionId = Array.isArray(searchParams.id)
    ? searchParams.id[0]
    : searchParams.id ?? ''

  return (
    <CVAnalyseClient
      positionName={positionName}
      jobDescription={jobDescription}
      jobDescriptionDetailed={jobDescriptionDetailed}
      positionId={positionId}
    />
  )
}
