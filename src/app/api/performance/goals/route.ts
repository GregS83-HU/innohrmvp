// app/api/performance/goals/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { requireSelf } from '../../../../../lib/authz';
import { safeErrorInfo } from '../../../../../lib/logSafe';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') // 'employee' or 'manager'
    const employee_id = searchParams.get('employee_id') // for manager viewing specific employee
    const user_id = searchParams.get('user_id') // current user's ID
    
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // Caller must genuinely be user_id - previously trusted outright,
    // letting anyone read anyone's own goals via the employee view.
    const authCheck = await requireSelf(request, user_id)
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const cookieStore = await cookies()
    
    // Use service role to bypass RLS for server-side operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore if called from Server Component
            }
          },
        },
      }
    )
    
    if (view === 'manager') {
      console.log('=== Manager View Debug ===')
      console.log('Manager user_id:', user_id)
      
      // Get manager's team members directly from user_profiles (same as timeclock route)
      const { data: teamMembers, error: teamError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('manager_id', user_id)
      
      if (teamError) {
        console.error('Team fetch error:', safeErrorInfo(teamError))
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
      }
      
      console.log('Team members found:', teamMembers?.length)
      
      if (!teamMembers || teamMembers.length === 0) {
        return NextResponse.json({ goals: [] })
      }
      
      const employeeIds = teamMembers.map(m => m.user_id)
      console.log('Employee IDs:', employeeIds)

      // If a specific employee is requested, it must actually be one of
      // this manager's real reports - previously this check was computed
      // (employeeIds, above) and then silently discarded, so any
      // employee_id was accepted regardless of team membership.
      let targetIds: string[]
      if (employee_id) {
        if (!employeeIds.includes(employee_id)) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
        targetIds = [employee_id]
      } else {
        targetIds = employeeIds
      }

      // Get goals using the view for better performance
      const { data: goals, error: goalsError } = await supabase
        .from('v_goals_with_status')
        .select('*')
        .in('employee_id', targetIds)
        .order('created_at', { ascending: false })
      
      if (goalsError) {
        console.error('Goals fetch error:', safeErrorInfo(goalsError))
        return NextResponse.json({ error: goalsError.message }, { status: 500 })
      }
      
      console.log('Goals found:', goals?.length)
      
      return NextResponse.json({ goals: goals || [] })
    } else {
      // Get employee's own goals
      const { data: goals, error: goalsError } = await supabase
        .from('v_goals_with_status')
        .select('*')
        .eq('employee_id', user_id)
        .order('created_at', { ascending: false })
      
      if (goalsError) {
        console.error('Goals fetch error:', safeErrorInfo(goalsError))
        return NextResponse.json({ error: goalsError.message }, { status: 500 })
      }
      
      return NextResponse.json({ goals: goals || [] })
    }
  } catch (error) {
    console.error('Get goals error:', safeErrorInfo(error))
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}