// app/jobs/[slug]/performance/pulse/page.tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Calendar, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Goal {
  id: string
  goal_title: string
  last_update_week: string | null
}

interface PulseData {
  [goalId: string]: {
    status: 'green' | 'yellow' | 'red'
    progress_comment: string
    blockers: string
  }
}

export default function WeeklyPulsePage() {
  const router = useRouter()
  const session = useSession()
  const params = useParams()
  const companySlug = params.slug as string

  const [goals, setGoals] = useState<Goal[]>([])
  const [pulseData, setPulseData] = useState<PulseData>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [weekStart, setWeekStart] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  useEffect(() => {
  if (!session) {
    router.push('/')
    return
  }

  fetchGoalsNeedingPulse(session.user.id)
}, [session, router])

  const fetchGoalsNeedingPulse = async (userId: string) => {
    setLoading(true)
    try {
      const { data: week } = await supabase.rpc('get_week_start')
      setWeekStart(week as string || '')

      const res = await fetch(`/api/performance/goals?view=employee&user_id=${userId}`)
      const data = await res.json()
      
      if (res.ok) {
        const activeGoals = (data.goals || []).filter((g: any) => g.status === 'active')
        const needsPulse = activeGoals.filter((g: any) => 
          !g.last_update_week || g.last_update_week !== week
        )
        
        setGoals(needsPulse)
        
        // Initialize pulse data
        const initialData: PulseData = {}
        needsPulse.forEach((goal: Goal) => {
          initialData[goal.id] = {
            status: 'green',
            progress_comment: '',
            blockers: ''
          }
        })
        setPulseData(initialData)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
    setLoading(false)
  }

  const updatePulse = (goalId: string, field: keyof PulseData[string], value: string) => {
    setPulseData(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
  if (!session?.user?.id) {
    setMessage({ text: 'No session found', type: 'error' })
    return
  }

  // Submit all pulses
  const promises = goals.map(goal =>
    fetch('/api/performance/pulse/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal_id: goal.id,
        employee_id: session.user.id, // Added this
        ...pulseData[goal.id]
      })
    })
  )
  
  const results = await Promise.all(promises)
  const allSuccessful = results.every(r => r.ok)
  
  if (allSuccessful) {
    setMessage({ text: 'Weekly pulse submitted successfully!', type: 'success' })
    setTimeout(() => {
      router.push(`/jobs/${companySlug}/performance`)
    }, 1500)
  } else {
    setMessage({ text: 'Some updates failed. Please try again.', type: 'error' })
  }
} catch (error) {
  setMessage({ text: `Error: ${(error as Error).message}`, type: 'error' })
}

    setSubmitting(false)
  }

  const getStatusButtonClass = (goalId: string, status: 'green' | 'yellow' | 'red') => {
    const isSelected = pulseData[goalId]?.status === status
    const baseClass = 'flex-1 py-3 px-4 rounded-lg font-medium transition-all text-center'
    
    if (isSelected) {
      switch (status) {
        case 'green':
          return `${baseClass} bg-green-500 text-white shadow-md`
        case 'yellow':
          return `${baseClass} bg-yellow-500 text-white shadow-md`
        case 'red':
          return `${baseClass} bg-red-500 text-white shadow-md`
      }
    }
    
    switch (status) {
      case 'green':
        return `${baseClass} bg-green-50 text-green-700 hover:bg-green-100 border border-green-200`
      case 'yellow':
        return `${baseClass} bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200`
      case 'red':
        return `${baseClass} bg-red-50 text-red-700 hover:bg-red-100 border border-red-200`
    }
  }

  if (!session || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pulse check...</p>
        </div>
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h2>
          <p className="text-gray-600 mb-6">You've already submitted your weekly pulse for all goals.</p>
          <button
            onClick={() => router.push(`/jobs/${companySlug}/performance`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    )
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
            <div className="bg-blue-100 rounded-lg p-3">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Weekly Pulse Check</h1>
              <p className="text-gray-600">Week starting: {new Date(weekStart).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Quick 2-minute check-in on your goals</p>
              <p>🟢 Green = On track | 🟡 Yellow = Some issues | 🔴 Red = Blocked/Need help</p>
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

        {/* Pulse Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {goals.map((goal, index) => (
            <div key={goal.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-lg">
                  Goal {index + 1}: {goal.goal_title}
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    How is this goal progressing?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => updatePulse(goal.id, 'status', 'green')}
                      className={getStatusButtonClass(goal.id, 'green')}
                    >
                      🟢 On Track
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePulse(goal.id, 'status', 'yellow')}
                      className={getStatusButtonClass(goal.id, 'yellow')}
                    >
                      🟡 Some Issues
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePulse(goal.id, 'status', 'red')}
                      className={getStatusButtonClass(goal.id, 'red')}
                    >
                      🔴 Blocked
                    </button>
                  </div>
                </div>

                {/* Progress Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Progress Update (optional)
                  </label>
                  <textarea
                    value={pulseData[goal.id]?.progress_comment || ''}
                    onChange={(e) => updatePulse(goal.id, 'progress_comment', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="What did you accomplish this week?"
                  />
                </div>

                {/* Blockers */}
                {pulseData[goal.id]?.status === 'red' && (
                  <div>
                    <label className="block text-sm font-semibold text-red-700 mb-2">
                      What's blocking you? *
                    </label>
                    <textarea
                      value={pulseData[goal.id]?.blockers || ''}
                      onChange={(e) => updatePulse(goal.id, 'blockers', e.target.value)}
                      className="w-full px-4 py-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-red-50"
                      rows={2}
                      placeholder="Describe what's blocking your progress so your manager can help"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitting ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit Weekly Pulse
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  )
}