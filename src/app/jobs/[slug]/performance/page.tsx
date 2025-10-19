// app/jobs/[slug]/performance/page.tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, Target, TrendingUp, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useLocale } from 'i18n/LocaleProvider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Goal {
  id: string
  goal_title: string
  goal_description: string
  success_criteria: string
  quarter: string
  year: number
  status: string
  created_by: string
  latest_status: 'green' | 'yellow' | 'red' | null
  latest_comment: string | null
  latest_blockers: string | null
  last_update_week: string | null
  last_update_date: string | null
  employee_name: string
  manager_name: string
  created_at: string
}

export default function PerformanceDashboard() {
  const { t } = useLocale()
  const router = useRouter()
  const session = useSession()
  const params = useParams()
  const companySlug = params.slug as string

  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQuarter, setCurrentQuarter] = useState('')
  const [weekStart, setWeekStart] = useState('')

  useEffect(() => {
    if (!session) {
      router.push(`/jobs/${companySlug}`)
      return
    }

    fetchGoals()
    fetchQuarterAndWeek()
  }, [session, router, companySlug])

  const fetchQuarterAndWeek = async () => {
    try {
      const { data: quarter } = await supabase.rpc('get_current_quarter')
      const { data: week } = await supabase.rpc('get_week_start')
      
      setCurrentQuarter(quarter as string || '')
      setWeekStart(week as string || '')
    } catch (error) {
      console.error('Error fetching quarter/week:', error)
    }
  }

  const fetchGoals = async () => {
    setLoading(true)
    try {
      if (!session?.user?.id) {
        console.error('No session found')
        setLoading(false)
        return
      }
      
      const res = await fetch(`/api/performance/goals?view=employee&user_id=${session.user.id}`)
      const data = await res.json()
      if (res.ok) {
        setGoals(data.goals || [])
      } else {
        console.error('Error fetching goals:', data.error)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
    setLoading(false)
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const draftGoals = goals.filter(g => g.status === 'draft')
  const needsPulseGoals = activeGoals.filter(g => !g.last_update_week || g.last_update_week !== weekStart)
  const redFlagGoals = activeGoals.filter(g => g.latest_status === 'red')

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200'
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'red': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string | null) => {
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

  const getPulseReminderText = (count: number) => {
    return count === 1
      ? t('performanceDashboard.pulseReminder.description', { count })
      : t('performanceDashboard.pulseReminder.description_plural', { count })
  }

  if (!session || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t('performanceDashboard.loading.message')}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {t('performanceDashboard.header.title')}
              </h1>
              <p className="text-gray-600">
                {t('performanceDashboard.header.subtitle', { quarter: currentQuarter })}
              </p>
            </div>
            <button
              onClick={() => router.push(`/jobs/${companySlug}/performance/goals/new`)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              {t('performanceDashboard.header.newGoalButton')}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{activeGoals.length}</p>
                <p className="text-sm text-gray-600">{t('performanceDashboard.quickStats.activeGoals')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 rounded-lg p-3">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{needsPulseGoals.length}</p>
                <p className="text-sm text-gray-600">{t('performanceDashboard.quickStats.needsPulse')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-lg p-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{redFlagGoals.length}</p>
                <p className="text-sm text-gray-600">{t('performanceDashboard.quickStats.redFlags')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{draftGoals.length}</p>
                <p className="text-sm text-gray-600">{t('performanceDashboard.quickStats.pendingApproval')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Pulse Reminder */}
        {needsPulseGoals.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {t('performanceDashboard.pulseReminder.title')}
                </h3>
                <p className="text-gray-700 mb-4">
                  {getPulseReminderText(needsPulseGoals.length)}
                </p>
                <button
                  onClick={() => router.push(`/jobs/${companySlug}/performance/pulse`)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-6 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
                >
                  {t('performanceDashboard.pulseReminder.submitButton')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approval Goals */}
        {draftGoals.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('performanceDashboard.pendingApproval.title')}
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {draftGoals.map(goal => (
                <div key={goal.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">{goal.goal_title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{goal.goal_description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{t('performanceDashboard.pendingApproval.manager', { name: goal.manager_name })}</span>
                        <span>{t('performanceDashboard.pendingApproval.separator')}</span>
                        <span>{t('performanceDashboard.pendingApproval.created', { date: formatDate(goal.created_at) })}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      {t('performanceDashboard.pendingApproval.pendingBadge')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Goals */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-5 h-5" />
              {t('performanceDashboard.activeGoals.title', { count: activeGoals.length })}
            </h2>
          </div>
          
          {activeGoals.length === 0 ? (
            <div className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {t('performanceDashboard.activeGoals.noGoals.title')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('performanceDashboard.activeGoals.noGoals.description')}
              </p>
              <button
                onClick={() => router.push(`/jobs/${companySlug}/performance/goals/new`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                {t('performanceDashboard.activeGoals.noGoals.createButton')}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeGoals.map(goal => (
                <div 
                  key={goal.id} 
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/jobs/${companySlug}/performance/goals/${goal.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">
                      {getStatusIcon(goal.latest_status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{goal.goal_title}</h3>
                        {goal.latest_status && (
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(goal.latest_status)}`}>
                            {goal.latest_status.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{goal.goal_description}</p>
                      
                      {goal.latest_comment && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700">{goal.latest_comment}</p>
                        </div>
                      )}
                      
                      {goal.latest_blockers && (
                        <div className="bg-red-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-red-800 mb-1">
                            {t('performanceDashboard.activeGoals.goalCard.blockers')}
                          </p>
                          <p className="text-sm text-gray-700">{goal.latest_blockers}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{t('performanceDashboard.activeGoals.goalCard.manager', { name: goal.manager_name })}</span>
                        <span>{t('performanceDashboard.activeGoals.goalCard.separator')}</span>
                        <span>
                          {goal.last_update_date 
                            ? t('performanceDashboard.activeGoals.goalCard.updated', { date: formatDate(goal.last_update_date) })
                            : t('performanceDashboard.activeGoals.goalCard.noUpdates')}
                        </span>
                        {!goal.last_update_week || goal.last_update_week !== weekStart ? (
                          <>
                            <span>{t('performanceDashboard.activeGoals.goalCard.separator')}</span>
                            <span className="text-yellow-600 font-medium">
                              {t('performanceDashboard.activeGoals.goalCard.needsPulse')}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>{t('performanceDashboard.activeGoals.goalCard.separator')}</span>
                            <span className="text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {t('performanceDashboard.activeGoals.goalCard.pulseSubmitted')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}