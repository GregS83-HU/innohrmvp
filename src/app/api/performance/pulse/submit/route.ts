import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { goal_id, status, progress_comment, blockers, employee_id } = body
    console.log('Pulse submit body:', body)

    // --- Input validation ---
    if (!goal_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!employee_id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
    }
    if (!['green', 'yellow', 'red'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // --- Supabase server client with cookies ---
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    // --- Get current week start ---
    const { data: weekStart, error: weekError } = await supabase.rpc('get_week_start')
    if (weekError) {
      console.error('Week start error:', weekError)
      return NextResponse.json({ error: 'Failed to get week start' }, { status: 500 })
    }
    console.log('Week start:', weekStart)

    // --- Check if a pulse already exists this week ---
    const { data: existing } = await supabase
      .from('goal_updates')
      .select('id')
      .eq('goal_id', goal_id)
      .eq('employee_id', employee_id)
      .eq('week_start_date', weekStart as string)
      .maybeSingle()

    if (existing) {
      // --- Update existing pulse ---
      const { data: updatedData, error: updateError } = await supabase
        .from('goal_updates')
        .update({
          status,
          progress_comment: progress_comment || null,
          blockers: blockers || null,
        })
        .eq('id', existing.id)
        .select('id, goal_id, employee_id, status, progress_comment, blockers, week_start_date')

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(updateError.message)
      }

      return NextResponse.json({
        message: 'Pulse updated successfully',
        update: updatedData?.[0],
      })
    }

    // --- Insert new pulse ---
    const { data: insertedData, error: insertError } = await supabase
      .from('goal_updates')
      .insert([
        {
          goal_id,
          employee_id,
          status,
          progress_comment: progress_comment || null,
          blockers: blockers || null,
          week_start_date: weekStart as string,
        },
      ])
      .select('id, goal_id, employee_id, status, progress_comment, blockers, week_start_date')

    if (insertError) {
      console.error('Insert error:', insertError)
      throw new Error(insertError.message)
    }

    return NextResponse.json({
      message: 'Pulse submitted successfully',
      update: insertedData?.[0],
    })
  } catch (error) {
    console.error('Pulse submission error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
