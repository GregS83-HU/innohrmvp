// app/jobs/[slug]/performance/team/page.tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Users, AlertTriangle, Target, TrendingUp, Plus } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Goal {
  id: string
  employee_id: string
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

interface EmployeeStats {
  employee_id: string
  employee_name: string
  total_goals: number
  active_goals: number
  red_flags: number
  yellow_flags: number
  green_flags: number
  needs_pulse: number
  pending_approval: number
}

export default function ManagerDashboard() {
  const router = useRouter()
  const session = useSession()
  const params = useParams()
  const companySlug = params.slug as string

  const [goals, setGoals] = useState<Goal[]>([])
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([])
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState('')
  const [selectedView, setSelectedView] = useState<'overview' | 'red-flags' | 'pending'>('overview')
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)
  //const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    fetchTeamGoals()
    fetchWeekStart()
  }, [session, router])

  const fetchWeekStart = async () => {
    try {
      const { data: week } = await supabase.rpc('get_week_start')
      setWeekStart(week as string || '')
    } catch (error) {
      console.error('Error fetching week:', error)
    }
  }

  const fetchTeamGoals = async () => {
    setLoading(true)
    try {
      if (!session?.user?.id) {
        console.error('No session found')
        setLoading(false)
        return
      }
      
      const res = await fetch(`/api/performance/goals?view=manager&user_id=${session.user.id}`)
      const data = await res.json()
      if (res.ok) {
        const teamGoals = data.goals || []
        console.log('Team goals fetched:', teamGoals.length)
        setGoals(teamGoals)
        calculateEmployeeStats(teamGoals)
      } else {
        console.error('Error fetching team goals:', data.error)
      }
    } catch (error) {
      console.error('Error fetching team goals:', error)
    }
    setLoading(false)
  }

  const calculateEmployeeStats = (teamGoals: Goal[]) => {
    const statsMap = new Map<string, EmployeeStats>()

    teamGoals.forEach(goal => {
      if (!statsMap.has(goal.employee_id)) {
        statsMap.set(goal.employee_id, {
          employee_id: goal.employee_id,
          employee_name: goal.employee_name,
          total_goals: 0,
          active_goals: 0,
          red_flags: 0,
          yellow_flags: 0,
          green_flags: 0,
          needs_pulse: 0,
          pending_approval: 0
        })
      }

      const stats = statsMap.get(goal.employee_id)!
      stats.total_goals++

      if (goal.status === 'active') {
        stats.active_goals++
        
        if (goal.latest_status === 'red') stats.red_flags++
        else if (goal.latest_status === 'yellow') stats.yellow_flags++
        else if (goal.latest_status === 'green') stats.green_flags++

        if (!goal.last_update_week || goal.last_update_week !== weekStart) {
          stats.needs_pulse++
        }
      }

      if (goal.status === 'draft') {
        stats.pending_approval++
      }
    })

    setEmployeeStats(Array.from(statsMap.values()))
  }

  const handleApproveGoal = async (goalId: string) => {
    try {
      const res = await fetch('/api/performance/goals/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_id: goalId,
          status: 'active'
        })
      })

      if (res.ok) {
        fetchTeamGoals()
      }
    } catch (error) {
      console.error('Error approving goal:', error)
    }
  }

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

  const redFlagGoals = goals.filter(g => g.status === 'active' && g.latest_status === 'red')
  const pendingGoals = goals.filter(g => g.status === 'draft')
  const totalRedFlags = redFlagGoals.length
  const totalPending = pendingGoals.length

  if (!session || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team dashboard...</p>
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
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Team Performance</h1>
                <p className="text-gray-600">Monitor your team's goals and progress</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/jobs/${companySlug}/performance`)}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              My Goals
            </button>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 bg-white rounded-xl shadow-sm p-2">
          <button
            onClick={() => setSelectedView('overview')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              selectedView === 'overview'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('red-flags')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              selectedView === 'red-flags'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Red Flags ({totalRedFlags})
          </button>
          <button
            onClick={() => setSelectedView('pending')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              selectedView === 'pending'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending Approval ({totalPending})
          </button>
        </div>

        {/* Overview View */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {employeeStats.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Team Members Yet</h3>
                <p className="text-gray-500">Your team members' goals will appear here</p>
              </div>
            ) : (
              employeeStats.map(employee => (
                <div key={employee.employee_id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{employee.employee_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {employee.active_goals} active goal{employee.active_goals !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {employee.red_flags > 0 && (
                          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            🔴 {employee.red_flags}
                          </div>
                        )}
                        {employee.yellow_flags > 0 && (
                          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            🟡 {employee.yellow_flags}
                          </div>
                        )}
                        {employee.green_flags > 0 && (
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            🟢 {employee.green_flags}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{employee.active_goals}</p>
                        <p className="text-xs text-gray-600">Active</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{employee.needs_pulse}</p>
                        <p className="text-xs text-gray-600">Needs Pulse</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{employee.pending_approval}</p>
                        <p className="text-xs text-gray-600">Pending</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // Filter to show only this employee's goals
                          const employeeGoals = goals.filter(g => g.employee_id === employee.employee_id)
                          if (employeeGoals.length > 0) {
                            // Navigate to first goal detail
                            router.push(`/jobs/${companySlug}/performance/goals/${employeeGoals[0].id}`)
                          }
                        }}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
                      >
                        View Goals
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Red Flags View */}
        {selectedView === 'red-flags' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Goals Needing Attention
              </h2>
            </div>
            
            {redFlagGoals.length === 0 ? (
              <div className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Red Flags</h3>
                <p className="text-gray-500">All team goals are on track!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {redFlagGoals.map(goal => (
                  <div 
                    key={goal.id} 
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/jobs/${companySlug}/performance/goals/${goal.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">🔴</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">{goal.goal_title}</h3>
                            <p className="text-sm text-gray-600">{goal.employee_name}</p>
                          </div>
                        </div>
                        
                        {goal.latest_blockers && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                            <p className="text-sm font-medium text-red-800 mb-1">Blockers:</p>
                            <p className="text-sm text-gray-700">{goal.latest_blockers}</p>
                          </div>
                        )}
                        
                        {goal.latest_comment && (
                          <div className="bg-gray-50 rounded-lg p-3 mt-2">
                            <p className="text-sm text-gray-700">{goal.latest_comment}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                          <span>Updated: {new Date(goal.last_update_date!).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Approval View */}
        {selectedView === 'pending' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Goals Awaiting Your Approval
              </h2>
            </div>
            
            {pendingGoals.length === 0 ? (
              <div className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Pending Goals</h3>
                <p className="text-gray-500">All goals have been reviewed</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingGoals.map(goal => (
                  <div key={goal.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">{goal.goal_title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{goal.employee_name}</p>
                        <p className="text-sm text-gray-700 mb-3">{goal.goal_description}</p>
                        {goal.success_criteria && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <p className="text-xs font-medium text-blue-800 mb-1">Success Criteria:</p>
                            <p className="text-sm text-gray-700">{goal.success_criteria}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveGoal(goal.id)}
                            className="bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-all text-sm"
                          >
                            Approve Goal
                          </button>
                          <button
                            onClick={() => router.push(`/jobs/${companySlug}/performance/goals/${goal.id}`)}
                            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-all text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}