'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NewOpenedPositionPage() {
  const router = useRouter()
  const session = useSession()

  const [positionName, setPositionName] = useState('')
  const [positionDescription, setPositionDescription] = useState('')
  const [positionDescriptionDetailed, setPositionDescriptionDetailed] = useState('')
  const [positionStartDate, setPositionStartDate] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [positionId, setPositionId] = useState<string | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{ matched: number; total: number } | null>(null)
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  if (!session) {
    return <p>Loading user info...</p>
  }

  const userId = session.user.id

  // Création de la position
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setAnalysisResult(null)

    setLoading(true)

    try {
      const res = await fetch('/api/new-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          id: positionId,
          position_name: positionName,
          position_description: positionDescription,
          position_description_detailed: positionDescriptionDetailed,
          position_start_date: positionStartDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: `❌ ${data.error || 'Error creating position'}`, type: 'error' })
      } else {
        setMessage({ text: '✅ New position successfully created', type: 'success' })
        setPositionId(data.id) // récupère l'ID pour lancer l'analyse
        setPositionName('')
        setPositionDescription('')
        setPositionDescriptionDetailed('')
        setPositionStartDate('')
      }
    } catch (error) {
      setMessage({ text: `❌ Unexpected error: ${(error as Error).message}`, type: 'error' })
    }

    setLoading(false)
  }

  // Lancement de l'analyse massive avec progression
  const handleAnalyseMassive = async () => {
    if (!positionId) return

    setAnalysisLoading(true)
    setAnalysisResult(null)
    setMessage(null)
    setProgress(0)

    try {
      // On utilise EventSource pour suivre la progression (Server-Sent Events)
      const es = new EventSource(`/api/analyse-massive?position_id=${positionId}`)

      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'progress') {
          setProgress(data.progress) // 0-100%
        } else if (data.type === 'done') {
          setAnalysisResult({ matched: data.matched, total: data.total })
          setMessage({
            text: `✅ Analyse completed: ${data.matched} / ${data.total} candidates are corresponding`,
            type: 'success',
          })
          setAnalysisLoading(false)
          es.close()
        } else if (data.type === 'error') {
          setMessage({ text: `❌ ${data.error}`, type: 'error' })
          setAnalysisLoading(false)
          es.close()
        }
      }

      es.onerror = (err) => {
        console.error('SSE error:', err)
        setMessage({ text: '❌ Unexpected server error during analysis', type: 'error' })
        setAnalysisLoading(false)
        es.close()
      }
    } catch (error) {
      setMessage({ text: `❌ Unexpected error: ${(error as Error).message}`, type: 'error' })
      setAnalysisLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create a New Position</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="positionName" className="block mb-1 font-medium">Position Name</label>
          <input
            id="positionName"
            type="text"
            value={positionName}
            onChange={(e) => setPositionName(e.target.value)}
            required
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="positionDescription" className="block mb-1 font-medium">Position Description (for display)</label>
          <textarea
            id="positionDescription"
            value={positionDescription}
            onChange={(e) => setPositionDescription(e.target.value)}
            required
            className="border rounded p-2 w-full"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="positionDescriptionDetailed" className="block mb-1 font-medium">Position Description Detailed (For AI analyse)</label>
          <textarea
            id="positionDescriptionDetailed"
            value={positionDescriptionDetailed}
            onChange={(e) => setPositionDescriptionDetailed(e.target.value)}
            required
            className="border rounded p-2 w-full"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="positionStartDate" className="block mb-1 font-medium">Starting Date</label>
          <input
            id="positionStartDate"
            type="date"
            value={positionStartDate}
            onChange={(e) => setPositionStartDate(e.target.value)}
            required
            className="border rounded p-2 w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>

      {positionId && (
        <div className="mt-6">
          <button
            onClick={handleAnalyseMassive}
            disabled={analysisLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {analysisLoading ? 'Analyse running...' : 'Launch analyse on the database'}
          </button>

          {analysisLoading && (
            <div className="w-full bg-gray-200 rounded mt-2 h-4 overflow-hidden">
              <div
                className="bg-green-400 h-4 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {message && (
        <p className={`mt-4 font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}

      {analysisResult && (
        <div className="mt-4">
          <button
            onClick={() => router.push(`/stats?positionId=${positionId}`)}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Voir détails
          </button>
        </div>
      )}
    </div>
  )
}
