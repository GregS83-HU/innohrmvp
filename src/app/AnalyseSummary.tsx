// src/components/AnalyseSummary.tsx
'use client'
import { useRouter } from 'next/navigation'

interface Props {
  positionId: string
  candidates: { score: number }[]
}

export default function AnalyseSummary({ positionId, candidates }: Props) {
  const router = useRouter()
  const matchedCandidates = candidates.filter(c => c.score >= 5).length
  const totalCandidates = candidates.length

  return (
    <div className="p-4 mt-4 border rounded shadow bg-white">
      <p>
        Analyse terminée : {matchedCandidates} candidats correspondent à cette position sur {totalCandidates}.
      </p>
      <button
        onClick={() => router.push(`/stats?positionId=${positionId}`)}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Voir détails
      </button>
    </div>
  )
}
