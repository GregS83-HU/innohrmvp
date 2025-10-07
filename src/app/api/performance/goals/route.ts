// app/api/performance/goals/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') // 'employee' or 'manager'
    const employee_id = searchParams.get('employee_id') // for manager viewing specific employee
    const user_id = searchParams.get('user_id') // current user's ID
    
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
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
        console.error('Team fetch error:', teamError)
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
      }
      
      console.log('Team members found:', teamMembers?.length)
      
      if (!teamMembers || teamMembers.length === 0) {
        return NextResponse.json({ goals: [] })
      }
      
      const employeeIds = teamMembers.map(m => m.user_id)
      console.log('Employee IDs:', employeeIds)
      
      // If specific employee requested, filter to just that employee
      const targetIds = employee_id ? [employee_id] : employeeIds
      
      // Get goals using the view for better performance
      const { data: goals, error: goalsError } = await supabase
        .from('v_goals_with_status')
        .select('*')
        .in('employee_id', targetIds)
        .order('created_at', { ascending: false })
      
      if (goalsError) {
        console.error('Goals fetch error:', goalsError)
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
        console.error('Goals fetch error:', goalsError)
        return NextResponse.json({ error: goalsError.message }, { status: 500 })
      }
      
      return NextResponse.json({ goals: goals || [] })
    }
  } catch (error) {
    console.error('Get goals error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}