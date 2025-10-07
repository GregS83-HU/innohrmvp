// app/jobs/[slug]/performance/goals/[goalId]/page.tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Target, Calendar, TrendingUp, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Goal {
  id: string
  employee_id: string
  manager_id: string
  goal_title: string
  goal_description: string
  success_criteria: string
  quarter: string
  year: number
  status: string
  created_by: string
  employee_name: string
  manager_name: string
  created_at: string
}

interface Update {
  id: string
  status: 'green' | 'yellow' | 'red'
  progress_comment: string | null
  blockers: string | null
  week_start_date: string
  created_at: string
}

export default function GoalDetailPage() {
  const router = useRouter()
  const session = useSession()
  const params = useParams()
  const companySlug = params.slug as string
  const goalId = params.goalId as string

  const [goal, setGoal] = useState<Goal | null>(null)
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [isManager, setIsManager] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    fetchGoalDetails()
  }, [session, router, goalId])

  const fetchGoalDetails = async () => {
    setLoading(true)
    try {
      // Fetch goal
      const { data: goalData, error: goalError } = await supabase
        .from('v_goals_with_status')
        .select('*')
        .eq('id', goalId)
        .single()

      if (goalError || !goalData) {
        console.error('Error fetching goal:', goalError)
        setLoading(false)
        return
      }

      setGoal(goalData)
      setIsManager(session?.user.id === goalData.manager_id)

      // Fetch all updates for this goal
      const { data: updatesData, error: updatesError } = await supabase
        .from('goal_updates')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false })

      if (!updatesError && updatesData) {
        setUpdates(updatesData)
      }
    } catch (error) {
      console.error('Error fetching goal details:', error)
    }
    setLoading(false)
  }

  const handleApprove = async () => {
    if (!session?.user?.id) {
      setMessage({ text: 'No session found', type: 'error' })
      return
    }

    try {
      const res = await fetch('/api/performance/goals/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_id: goalId,
          status: 'active',
          user_id: session.user.id // Added this
        })
      })

      if (res.ok) {
        setMessage({ text: 'Goal approved successfully!', type: 'success' })
        fetchGoalDetails()
      } else {
        const data = await res.json()
        setMessage({ text: data.error || 'Failed to approve goal', type: 'error' })
      }
    } catch (error) {
      setMessage({ text: `Error: ${(error as Error).message}`, type: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return
    }

    if (!session?.user?.id) {
      setMessage({ text: 'No session found', type: 'error' })
      return
    }

    try {
      const res = await fetch(`/api/performance/goals/update?goal_id=${goalId}&user_id=${session.user.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.push(`/jobs/${companySlug}/performance`)
      } else {
        const data = await res.json()
        setMessage({ text: data.error || 'Failed to delete goal', type: 'error' })
      }
    } catch (error) {
      setMessage({ text: `Error: ${(error as Error).message}`, type: 'error' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200'
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'red': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green': return '🟢'
      case 'yellow': return '🟡'
      case 'red': return '🔴'
      default: return '⚪'
    }
  }

  if (!session || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading goal details...</p>
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Goal Not Found</h2>
          <p className="text-gray-600 mb-6">This goal doesn&apos;t exist or you don&apos;t have access to it.</p>
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
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <button
            onClick={() => router.push(isManager ? `/jobs/${companySlug}/performance/team` : `/jobs/${companySlug}/performance`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {isManager ? 'Team' : 'My'} Dashboard
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="bg-blue-100 rounded-lg p-3">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{goal.goal_title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span>Employee: {goal.employee_name}</span>
                  <span>•</span>
                  <span>Manager: {goal.manager_name}</span>
                  <span>•</span>
                  <span>{goal.quarter}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {goal.status === 'draft' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  Pending Approval
                </span>
              )}
              {goal.status === 'active' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Active
                </span>
              )}
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

        {/* Approval Section for Managers */}
        {isManager && goal.status === 'draft' && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Manager Approval Required</h3>
            <p className="text-gray-700 mb-4">{goal.employee_name} is waiting for your approval on this goal.</p>
            <button
              onClick={handleApprove}
              className="bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
            >
              Approve Goal
            </button>
          </div>
        )}

        {/* Goal Details */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-800">{goal.goal_description || 'No description provided'}</p>
            </div>

            {goal.success_criteria && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Success Criteria</h3>
                <p className="text-gray-800">{goal.success_criteria}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Created {goal.created_by === 'employee' ? 'by employee' : 'by manager'} on {new Date(goal.created_at).toLocaleDateString()}
                </div>
                {(session?.user.id === goal.employee_id || session?.user.id === goal.manager_id) && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Goal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progress Timeline ({updates.length} updates)
            </h2>
          </div>
          
          {updates.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Updates Yet</h3>
              <p className="text-gray-500">Weekly pulse updates will appear here</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {updates.map((update, index) => (
                  <div key={update.id} className="relative">
                    {/* Timeline line */}
                    {index !== updates.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    
                    <div className="flex gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm border-2 ${
                          update.status === 'green' ? 'bg-green-50 border-green-200' :
                          update.status === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-red-50 border-red-200'
                        }`}>
                          {getStatusIcon(update.status)}
                        </div>
                      </div>

                      {/* Update Content */}
                      <div className="flex-1 pb-8">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-800">
                                Week of {new Date(update.week_start_date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(update.created_at).toLocaleDateString()} at {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(update.status)}`}>
                              {update.status.toUpperCase()}
                            </span>
                          </div>

                          {update.progress_comment && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Progress Update:</p>
                              <p className="text-sm text-gray-600">{update.progress_comment}</p>
                            </div>
                          )}

                          {update.blockers && (
                            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-sm font-medium text-red-800 mb-1">Blockers:</p>
                              <p className="text-sm text-gray-700">{update.blockers}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {goal.status === 'active' && session?.user.id === goal.employee_id && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Actions</h3>
            <p className="text-gray-600 mb-4">Keep your goal up to date with weekly pulse checks</p>
            <button
              onClick={() => router.push(`/jobs/${companySlug}/performance/pulse`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <Calendar className="w-5 h-5 inline-block mr-2" />
              Submit Weekly Pulse
            </button>
          </div>
        )}
      </div>
    </main>
  )
}