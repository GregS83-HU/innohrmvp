import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabaseServerClient'
import { safeErrorInfo } from '../../../../lib/logSafe';

export async function POST(request: Request) {
  try {
    const { positionId } = await request.json()

    if (!positionId) {
      return NextResponse.json({ error: 'positionId is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    console.log("ID to close:",positionId)

    const {data, error } = await supabase
      .from('openedpositions')
      .update({ position_end_date: new Date().toISOString() })
      .eq('id', positionId)
      .select();

    if (error) {
      console.error('Supabase update error:', safeErrorInfo(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Rows updated count:", data?.length ?? 0)

    return NextResponse.json({ message: 'Position closed' })
  } catch (error) {
    console.error('Unexpected error:', safeErrorInfo(error))
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}