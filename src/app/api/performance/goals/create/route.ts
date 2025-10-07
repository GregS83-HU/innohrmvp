// app/api/performance/pulse/submit/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { goal_id, status, progress_comment, blockers, employee_id } = body
    
    if (!goal_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (!employee_id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
    }
    
    if (!['green', 'yellow', 'red'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
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
    
    // Get week start date
    const { data: weekStart, error: weekError } = await supabase.rpc('get_week_start')
    
    if (weekError) {
      console.error('Week start error:', weekError)
      return NextResponse.json({ error: 'Failed to get week start' }, { status: 500 })
    }
    
    // Check if user already submitted pulse for this goal this week
    const { data: existing, error: existingError } = await supabase
      .from('goal_updates')
      .select('id')
      .eq('goal_id', goal_id)
      .eq('employee_id', employee_id)
      .eq('week_start_date', weekStart as string)
      .single()
    
    if (existing && !existingError) {
      // Update existing pulse
      const { data: updatedData, error: updateError } = await supabase
        .from('goal_updates')
        .update({
          status,
          progress_comment: progress_comment || null,
          blockers: blockers || null
        })
        .eq('id', existing.id)
        .select()
      
      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      return NextResponse.json({
        message: 'Pulse updated successfully',
        update: updatedData[0]
      })
    }
    
    // Insert new pulse
    const { data: insertedData, error: insertError } = await supabase
      .from('goal_updates')
      .insert([
        {
          goal_id,
          employee_id: employee_id,
          status,
          progress_comment: progress_comment || null,
          blockers: blockers || null,
          week_start_date: weekStart as string
        }
      ])
      .select()
    
    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    
    if (!insertedData || insertedData.length === 0) {
      return NextResponse.json({ error: 'Failed to submit pulse' }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'Pulse submitted successfully',
      update: insertedData[0]
    })
  } catch (error) {
    console.error('Pulse submission error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}