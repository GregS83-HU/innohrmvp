// app/api/interviews/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendInterviewInvitation, sendInterviewCancellation } from '../../../../lib/email-service'
import { getServerTranslation } from '../../../i18n/server-translations' 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const candidat_id = searchParams.get('candidat_id')
  if (!candidat_id) return NextResponse.json([], { status: 200 })

  const { data, error } = await supabase
    .from('interviews')
    .select('*, recruitment_steps(step_name)')
    .eq('candidat_id', candidat_id)
    .order('interview_datetime', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      position_id, 
      candidat_id, 
      recruiter_id, 
      interview_datetime, 
      duration_minutes, 
      location,
      locale  // ⭐ Added: Get locale from request
    } = body

    console.log('[Interviews API] Creating interview:', body)

    // Fetch the current recruitment step for this candidate/position
    let recruitment_step_id: number | null = null
    
    if (position_id && candidat_id) {
      const { data: positionCandidat, error: pcErr } = await supabase
        .from('position_to_candidat')
        .select('candidat_next_step')
        .eq('position_id', position_id)
        .eq('candidat_id', candidat_id)
        .single()

      if (!pcErr && positionCandidat?.candidat_next_step) {
        recruitment_step_id = positionCandidat.candidat_next_step
      }
    }

    // Insert interview into database with recruitment step
    const { data: interview, error: insertError } = await supabase
      .from('interviews')
      .insert([{ 
        position_id, 
        candidat_id, 
        recruiter_id, 
        interview_datetime, 
        duration_minutes, 
        location,
        recruitment_step_id,
        status: 'pending' 
      }])
      .select()
      .single()

    if (insertError) {
      console.error('[Interviews API] Insert error:', insertError)
      return NextResponse.json({ error: insertError.message, details: insertError.details }, { status: 400 })
    }

    console.log('[Interviews API] Interview created:', interview)

    // Fetch candidate details
    const { data: candidate, error: candidateError } = await supabase
      .from('candidats')
      .select('candidat_email, candidat_firstname, candidat_lastname')
      .eq('id', candidat_id)
      .single()

    if (candidateError || !candidate) {
      console.error('[Interviews API] Candidate not found:', candidateError)
      return NextResponse.json({ 
        error: 'Interview created but candidate not found for email',
        interview 
      }, { status: 207 })
    }

    // Fetch recruiter details from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(recruiter_id)

    if (authError || !authUser) {
      console.error('[Interviews API] Recruiter auth not found:', authError)
      return NextResponse.json({ 
        error: 'Interview created but recruiter not found for email',
        interview 
      }, { status: 207 })
    }

    // Fetch recruiter name from users table
    const { data: recruiterData, error: recruiterError } = await supabase
      .from('users')
      .select('user_firstname, user_lastname')
      .eq('id', recruiter_id)
      .single()

    if (recruiterError || !recruiterData) {
      console.error('[Interviews API] Recruiter data not found:', recruiterError)
      return NextResponse.json({ 
        error: 'Interview created but recruiter data not found',
        interview 
      }, { status: 207 })
    }

    // Fetch position details
    const { data: position, error: positionError } = await supabase
      .from('openedpositions')
      .select('position_name')
      .eq('id', position_id)
      .single()

    if (positionError || !position) {
      console.error('[Interviews API] Position not found:', positionError)
      return NextResponse.json({ 
        error: 'Interview created but position not found',
        interview 
      }, { status: 207 })
    }

    // ⭐ Added: Get translation function for the user's locale
    const t = getServerTranslation(locale || 'en')

    // Send interview invitation emails
    try {
      await sendInterviewInvitation({
        candidate: {
          email: candidate.candidat_email,
          firstName: candidate.candidat_firstname,
          lastName: candidate.candidat_lastname,
        },
        recruiter: {
          email: authUser.user.email!,
          firstName: recruiterData.user_firstname,
          lastName: recruiterData.user_lastname,
        },
        position: {
          title: position.position_name,
        },
        interview: {
          datetime: new Date(interview_datetime),
          location: location || 'TBD',
          durationMinutes: duration_minutes || 60,
        },
        t,  // ⭐ Added: Pass translation function
      })

      console.log('[Interviews API] ✅ Invitation emails sent successfully')
    } catch (emailError) {
      console.error('[Interviews API] ❌ Failed to send emails:', emailError)
      // Interview is still created, just email failed
      return NextResponse.json({ 
        warning: 'Interview created but failed to send emails',
        interview,
        emailError: emailError instanceof Error ? emailError.message : 'Unknown error'
      }, { status: 201 })
    }

    return NextResponse.json(interview)

  } catch (err: unknown) {
    console.error('[Interviews API] Exception:', err)

    // Narrow unknown to Error safely
    const message = err instanceof Error ? err.message : 'Unknown error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id, status, notes, ai_summary, locale } = body  // ⭐ Added: Get locale from request

  // Update interview status
  const { data, error } = await supabase
    .from('interviews')
    .update({ status, notes, ai_summary })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // If status is being set to "cancelled", send cancellation email
  if (status === 'cancelled') {
    try {
      // Fetch interview details with all related data
      const { data: interview, error: interviewError } = await supabase
        .from('interviews')
        .select('*, candidat_id, position_id, recruiter_id')
        .eq('id', id)
        .single()

      if (interviewError || !interview) {
        console.error('[Interviews API] Interview not found for cancellation email')
        return NextResponse.json(data) // Still return success, just no email
      }

      // Fetch candidate
      const { data: candidate, error: candidateError } = await supabase
        .from('candidats')
        .select('candidat_email, candidat_firstname, candidat_lastname')
        .eq('id', interview.candidat_id)
        .single()

      if (candidateError || !candidate?.candidat_email) {
        console.error('[Interviews API] Candidate not found for cancellation email')
        return NextResponse.json(data)
      }

      // Fetch recruiter
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(interview.recruiter_id)
      
      const { data: recruiterData, error: recruiterError } = await supabase
        .from('users')
        .select('user_firstname, user_lastname')
        .eq('id', interview.recruiter_id)
        .single()

      if (authError || recruiterError || !authUser || !recruiterData) {
        console.error('[Interviews API] Recruiter not found for cancellation email')
        return NextResponse.json(data)
      }

      // Fetch position
      const { data: position, error: positionError } = await supabase
        .from('openedpositions')
        .select('position_name')
        .eq('id', interview.position_id)
        .single()

      if (positionError || !position) {
        console.error('[Interviews API] Position not found for cancellation email')
        return NextResponse.json(data)
      }

      // ⭐ Added: Get translation function for the user's locale
      const t = getServerTranslation(locale || 'en')

      // Send cancellation email
      await sendInterviewCancellation({
        candidate: {
          email: candidate.candidat_email,
          firstName: candidate.candidat_firstname,
          lastName: candidate.candidat_lastname,
        },
        recruiter: {
          firstName: recruiterData.user_firstname,
          lastName: recruiterData.user_lastname,
        },
        position: {
          title: position.position_name,
        },
        interview: {
          datetime: new Date(interview.interview_datetime),
          location: interview.location || 'TBD',
          durationMinutes: interview.duration_minutes || 60,
        },
        t,  // ⭐ Added: Pass translation function
      })

      console.log('[Interviews API] ✅ Cancellation email sent successfully')
    } catch (emailError) {
      console.error('[Interviews API] ❌ Failed to send cancellation email:', emailError)
      // Interview is still cancelled, just email failed
    }
  }

  return NextResponse.json(data)
}