import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, position_name, position_description, position_description_detailed, position_start_date } = body

    if (!user_id || !position_name || !position_description || !position_description_detailed || !position_start_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    // Ici on utilise .insert(...).select() pour récupérer l'ID
    const { data: insertedData, error: insertError } = await supabase
      .from('openedpositions')
      .insert([
        {
          position_name,
          position_description,
          position_description_detailed,
          position_start_date,
          user_id,
          company_id: company.company_id,
        },
      ])
      .select() // ← important pour récupérer les champs insérés

    if (insertError || !insertedData || insertedData.length === 0) {
      return NextResponse.json({ error: insertError?.message || 'Failed to create position' }, { status: 500 })
    }

    // On renvoie l'ID de la position créée
    return NextResponse.json({ message: 'Position created successfully', id: insertedData[0].id })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
