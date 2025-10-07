// app/jobs/[slug]/performance/goals/new/page.tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Target, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function NewGoalPage() {
  const router = useRouter()
  const session = useSession()
  const params = useParams()
  const companySlug = params.slug as string

  const [goalTitle, setGoalTitle] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [successCriteria, setSuccessCriteria] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/performance/goals/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    employee_id: session?.user.id,
    goal_title: goalTitle,
    goal_description: goalDescription,
    success_criteria: successCriteria,
    created_by: 'employee'
  })
})

      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: data.error || 'Error creating goal', type: 'error' })
      } else {
        setMessage({ text: 'Goal created and sent for manager approval!', type: 'success' })
        setTimeout(() => {
          router.push(`/jobs/${companySlug}/performance`)
        }, 1500)
      }
    } catch (error) {
      setMessage({ text: `Error: ${(error as Error).message}`, type: 'error' })
    }

    setLoading(false)
  }

  if (!session) {
    return null
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <button
            onClick={() => router.push(`/jobs/${companySlug}/performance`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 rounded-lg p-3">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Create New Goal</h1>
              <p className="text-gray-600">Define a goal for this quarter</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Tips for effective goals:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Be specific and measurable</li>
                <li>Define clear success criteria</li>
                <li>Your manager will review and approve the goal</li>
              </ul>
            </div>
          </div>
        </div>

        {message && (
          <div className={`rounded-xl p-4 ${
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

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Goal Title */}
              <div>
                <label htmlFor="goalTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                  Goal Title *
                </label>
                <input
                  id="goalTitle"
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Improve customer satisfaction score by 15%"
                />
              </div>

              {/* Goal Description */}
              <div>
                <label htmlFor="goalDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  Goal Description
                </label>
                <textarea
                  id="goalDescription"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  placeholder="Describe what you want to achieve and why it matters..."
                />
              </div>

              {/* Success Criteria */}
              <div>
                <label htmlFor="successCriteria" className="block text-sm font-semibold text-gray-700 mb-2">
                  Success Criteria
                </label>
                <textarea
                  id="successCriteria"
                  value={successCriteria}
                  onChange={(e) => setSuccessCriteria(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="How will you know you've achieved this goal? Be specific..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating Goal...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    Create Goal
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}