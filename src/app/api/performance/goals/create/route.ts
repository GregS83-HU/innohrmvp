import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📥 Request body:', body)
    
    const {
      employee_id,
      goal_title,
      goal_description,
      success_criteria,
      created_by
    } = body

    if (!employee_id || !goal_title || !created_by) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use service role client (like your openedpositions route)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', employee_id)
      .single()
    
    console.log('🏢 Company lookup:', { company, error: companyError?.message })

    if (companyError || !company) {
      return NextResponse.json({ 
        error: companyError?.message || 'Company not found' 
      }, { status: 400 })
    }

    // Get manager
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('manager_id')
      .eq('user_id', employee_id)
      .single()
    
    console.log('👤 Profile lookup:', { profile, error: profileError?.message })

    if (profileError || !profile?.manager_id) {
      return NextResponse.json({ 
        error: 'Manager not found for employee' 
      }, { status: 400 })
    }

    // Get quarter
    const { data: quarterData, error: quarterError } = await supabaseAdmin.rpc('get_current_quarter')
    console.log('📅 Quarter lookup:', { quarter: quarterData, error: quarterError?.message })

    if (quarterError) {
      return NextResponse.json({ 
        error: 'Failed to get current quarter' 
      }, { status: 500 })
    }

    const quarter = quarterData as string
    const year = new Date().getFullYear()
    const status = created_by === 'employee' ? 'draft' : 'active'

    const goalData = {
      employee_id,
      manager_id: profile.manager_id,
      company_id: company.company_id,
      goal_title,
      goal_description,
      success_criteria,
      quarter,
      year,
      status,
      created_by
    }

    console.log('📝 Attempting insert with data:', goalData)

    // Insert the goal using service role (bypasses RLS)
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('performance_goals')
      .insert([goalData])
      .select()

    if (insertError) {
      console.error('❌ Insert failed:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      })
      return NextResponse.json({ 
        error: insertError.message || 'Failed to create goal'
      }, { status: 500 })
    }

    if (!insertedData || insertedData.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create goal' 
      }, { status: 500 })
    }

    console.log('✅ Goal created successfully:', insertedData)

    return NextResponse.json({
      message: 'Goal created successfully',
      goal: insertedData[0]
    })

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 })
  }
}