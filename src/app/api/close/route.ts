import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabaseServerClient'

export async function POST(request: Request) {
  try {
    const { positionId } = await request.json()

    if (!positionId) {
      return NextResponse.json({ error: 'positionId is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('OpenedPositions')
      .update({ position_end_date: new Date().toISOString() })
      .eq('id', positionId)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Position closed' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}