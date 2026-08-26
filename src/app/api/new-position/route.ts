import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { hasFeatureAccess, entitlementErrorBody } from '../../../../lib/entitlements'
import { safeErrorInfo } from '../../../../lib/logSafe';

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      user_id, 
      manager_id, 
      position_name, 
      position_description, 
      position_description_detailed, 
      position_start_date,
      // NEW ENRICHMENT FIELDS
      location,
      location_type,
      employment_type,
      salary_min,
      salary_max,
      salary_currency,
      salary_public,
      application_deadline,
    } = body

    // Validate required fields
    if (!user_id || !manager_id || !position_name || !position_description || !position_description_detailed || !position_start_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate employment_type is required
    if (!employment_type) {
      return NextResponse.json({ error: 'Employment type is required' }, { status: 400 })
    }

    const supabase = createServerComponentClient({ cookies })

    const { data: company, error: companyError } = await supabase
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', user_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: companyError?.message || 'Company not found' }, { status: 400 })
    }

    const entitlement = await hasFeatureAccess(company.company_id, 'recruitment.openPosition')
    if (!entitlement.allowed) {
      return NextResponse.json(entitlementErrorBody('recruitment.openPosition', entitlement), { status: 403 })
    }

    const { data: insertedData, error: insertError } = await supabase
      .from('openedpositions')
      .insert([
        {
          position_name,
          position_description,
          position_description_detailed,
          position_start_date,
          user_id,
          manager_id,
          company_id: company.company_id,
          // NEW ENRICHMENT FIELDS
          location: location || null,
          location_type: location_type || null,
          employment_type: employment_type, // Required field
          salary_min: salary_min || null,
          salary_max: salary_max || null,
          salary_currency: salary_currency || 'HUF',
          salary_public: salary_public || false,
          application_deadline: application_deadline || null,
        },
      ])
      .select()

    if (insertError || !insertedData || insertedData.length === 0) {
      console.error('Insert error:', safeErrorInfo(insertError))
      return NextResponse.json({ error: insertError?.message || 'Failed to create position' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Position created successfully', id: insertedData[0].id })
  } catch (error) {
    console.error('Route error:', safeErrorInfo(error))
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}