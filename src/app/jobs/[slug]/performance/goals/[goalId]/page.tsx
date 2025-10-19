// app/jobs/[slug]/performance/goals/[goalId]/page.tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Target, Calendar, TrendingUp, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useLocale } from 'i18n/LocaleProvider'

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
  const { t } = useLocale()
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
      setMessage({ text: t('goalDetailPage.messages.noSession'), type: 'error' })
      return
    }

    try {
      const res = await fetch('/api/performance/goals/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_id: goalId,
          status: 'active',
          user_id: session.user.id
        })
      })

      if (res.ok) {
        setMessage({ text: t('goalDetailPage.messages.approveSuccess'), type: 'success' })
        fetchGoalDetails()
      } else {
        const data = await res.json()
        setMessage({ text: data.error || t('goalDetailPage.messages.approveFailed'), type: 'error' })
      }
    } catch (error) {
      setMessage({ text: t('goalDetailPage.messages.error', { message: (error as Error).message }), type: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('goalDetailPage.messages.deleteConfirm'))) {
      return
    }

    if (!session?.user?.id) {
      setMessage({ text: t('goalDetailPage.messages.noSession'), type: 'error' })
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
        setMessage({ text: data.error || t('goalDetailPage.messages.deleteFailed'), type: 'error' })
      }
    } catch (error) {
      setMessage({ text: t('goalDetailPage.messages.error', { message: (error as Error).message }), type: 'error' })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (!session || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t('goalDetailPage.loading.message')}</p>
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('goalDetailPage.notFound.title')}</h2>
          <p className="text-gray-600 mb-6">{t('goalDetailPage.notFound.description')}</p>
          <button
            onClick={() => router.push(`/jobs/${companySlug}/performance`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            {t('goalDetailPage.notFound.backButton')}
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
            {isManager ? t('goalDetailPage.header.backToTeam') : t('goalDetailPage.header.backToMy')}
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="bg-blue-100 rounded-lg p-3">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{goal.goal_title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span>{t('goalDetailPage.header.employee')} {goal.employee_name}</span>
                  <span>{t('goalDetailPage.header.separator')}</span>
                  <span>{t('goalDetailPage.header.manager')} {goal.manager_name}</span>
                  <span>{t('goalDetailPage.header.separator')}</span>
                  <span>{goal.quarter}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {goal.status === 'draft' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  {t('goalDetailPage.status.pendingApproval')}
                </span>
              )}
              {goal.status === 'active' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {t('goalDetailPage.status.active')}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('goalDetailPage.approval.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('goalDetailPage.approval.description', { employeeName: goal.employee_name })}
            </p>
            <button
              onClick={handleApprove}
              className="bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
            >
              {t('goalDetailPage.approval.approveButton')}
            </button>
          </div>
        )}

        {/* Goal Details */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {t('goalDetailPage.details.descriptionLabel')}
              </h3>
              <p className="text-gray-800">
                {goal.goal_description || t('goalDetailPage.details.noDescription')}
              </p>
            </div>

            {goal.success_criteria && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {t('goalDetailPage.details.successCriteriaLabel')}
                </h3>
                <p className="text-gray-800">{goal.success_criteria}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {goal.created_by === 'employee' 
                    ? t('goalDetailPage.details.createdByEmployee', { date: formatDate(goal.created_at) })
                    : t('goalDetailPage.details.createdByManager', { date: formatDate(goal.created_at) })
                  }
                </div>
                {(session?.user.id === goal.employee_id || session?.user.id === goal.manager_id) && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('goalDetailPage.details.deleteButton')}
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
              {t('goalDetailPage.timeline.title', { count: updates.length })}
            </h2>
          </div>
          
          {updates.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {t('goalDetailPage.timeline.noUpdates.title')}
              </h3>
              <p className="text-gray-500">
                {t('goalDetailPage.timeline.noUpdates.description')}
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {updates.map((update, index) => {
                  const dateTime = formatDateTime(update.created_at)
                  return (
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
                                  {t('goalDetailPage.timeline.weekOf', { date: formatDate(update.week_start_date) })}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {dateTime.date} at {dateTime.time}
                                </p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(update.status)}`}>
                                {t(`goalDetailPage.status.${update.status}`)}
                              </span>
                            </div>

                            {update.progress_comment && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  {t('goalDetailPage.timeline.progressUpdate')}
                                </p>
                                <p className="text-sm text-gray-600">{update.progress_comment}</p>
                              </div>
                            )}

                            {update.blockers && (
                              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-red-800 mb-1">
                                  {t('goalDetailPage.timeline.blockers')}
                                </p>
                                <p className="text-sm text-gray-700">{update.blockers}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {goal.status === 'active' && session?.user.id === goal.employee_id && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('goalDetailPage.quickActions.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('goalDetailPage.quickActions.description')}
            </p>
            <button
              onClick={() => router.push(`/jobs/${companySlug}/performance/pulse`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <Calendar className="w-5 h-5 inline-block mr-2" />
              {t('goalDetailPage.quickActions.submitPulseButton')}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}