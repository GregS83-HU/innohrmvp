import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')

  console.log("user:", user_id)

  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { data, error } = await supabase
      .rpc('get_recruitment_steps_for_user', { user_id })

    if (error) {
      console.error('Supabase RPC error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      console.error('Supabase RPC returned no data')
      return NextResponse.json({ error: 'No data returned' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Unexpected error:', error.message || error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
