'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter,usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, Calendar, FileText, Briefcase, BarChart3, CheckCircle, AlertCircle, Activity } from 'lucide-react'

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
  const pathname = usePathname()

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user info...</p>
        </div>
      </div>
    )
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
        setMessage({ text: `${data.error || 'Error creating position'}`, type: 'error' })
      } else {
        setMessage({ text: 'New position successfully created', type: 'success' })
        setPositionId(data.id) // récupère l'ID pour lancer l'analyse
        setPositionName('')
        setPositionDescription('')
        setPositionDescriptionDetailed('')
        setPositionStartDate('')
      }
    } catch (error) {
      setMessage({ text: `Unexpected error: ${(error as Error).message}`, type: 'error' })
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
      const es = new EventSource(`/api/analyse-massive?position_id=${positionId}&user_id=${userId}`)

      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'progress') {
          setProgress(data.progress) // 0-100%
        } else if (data.type === 'done') {
          setAnalysisResult({ matched: data.matched, total: data.total })
          setMessage({
            text: `Analyse completed: ${data.matched} / ${data.total} candidates are corresponding`,
            type: 'success',
          })
          setAnalysisLoading(false)
          es.close()
        } else if (data.type === 'error') {
          setMessage({ text: `${data.error}`, type: 'error' })
          setAnalysisLoading(false)
          es.close()
        }
      }

      es.onerror = (err) => {
        console.error('SSE error:', err)
        setMessage({ text: 'Unexpected server error during analysis', type: 'error' })
        setAnalysisLoading(false)
        es.close()
      }
    } catch (error) {
      setMessage({ text: `Unexpected error: ${(error as Error).message}`, type: 'error' })
      setAnalysisLoading(false)
    }
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
            <Plus className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Create a New Position
            </h1>
            <p className="text-gray-600">Fill out the form below to create a new job position</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Position Name */}
              <div>
                <label htmlFor="positionName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Briefcase className="w-4 h-4" />
                  Position Name
                </label>
                <input
                  id="positionName"
                  type="text"
                  value={positionName}
                  onChange={(e) => setPositionName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. Senior Software Developer"
                />
              </div>

              {/* Position Description */}
              <div>
                <label htmlFor="positionDescription" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-4 h-4" />
                  Position Description (for display)
                </label>
                <textarea
                  id="positionDescription"
                  value={positionDescription}
                  onChange={(e) => setPositionDescription(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  placeholder="Brief description that will be shown to candidates..."
                />
              </div>

              {/* Position Description Detailed */}
              <div>
                <label htmlFor="positionDescriptionDetailed" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Activity className="w-4 h-4" />
                  Position Description Detailed (For AI analyse)
                </label>
                <textarea
                  id="positionDescriptionDetailed"
                  value={positionDescriptionDetailed}
                  onChange={(e) => setPositionDescriptionDetailed(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  placeholder="Detailed requirements, skills, and qualifications for AI matching..."
                />
              </div>

              {/* Starting Date */}
              <div>
                <label htmlFor="positionStartDate" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Calendar className="w-4 h-4" />
                  Starting Date
                </label>
                <input
                  id="positionStartDate"
                  type="date"
                  value={positionStartDate}
                  onChange={(e) => setPositionStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Position
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Messages - Now positioned right after the form */}
        {message && (
          <div className={`rounded-2xl p-4 sm:p-6 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={`font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Analysis Section */}
        {positionId && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Activity className="w-5 h-5" />
                Candidate Analysis
              </h3>
              
              <button
                onClick={handleAnalyseMassive}
                disabled={analysisLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
              >
                {analysisLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Analyse running...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    Launch analyse on the database
                  </>
                )}
              </button>

              {/* Progress Bar */}
              {analysisLoading && (
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results & Action */}
        {analysisResult && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <BarChart3 className="w-5 h-5" />
                Analysis Results
              </h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {analysisResult.matched} / {analysisResult.total}
                  </div>
                  <p className="text-gray-600">Matching candidates found</p>
                </div>
              </div>

              <button
  onClick={() => {
    // Take the slug part from current pathname, e.g. /jobs/demo/openedpositions/new
    const basePath = pathname.split('/openedpositions')[0] // /jobs/demo
    router.push(`${basePath}/stats?positionId=${positionId}`)
  }}
  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
>
  <BarChart3 className="w-5 h-5" />
  View Details
</button>

            </div>
          </div>
        )}
      </div>
    </main>
  )
}