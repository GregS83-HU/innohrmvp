// /api/medical-certificates/confirm/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hasFeatureAccess, entitlementErrorBody } from '../../../../../lib/entitlements'
import { requireCompanyAdmin } from '../../../../../lib/authz'
import { safeErrorInfo } from '../../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const employee_name = formData.get('employee_name') as string | null
    const absenceDateStart = formData.get('absenceDateStart') as string | null
    const absenceDateEnd = formData.get('absenceDateEnd') as string | null
    const employee_comment = formData.get('comment') as string | null
    const file = formData.get('file') as File | null
    const leave_request_id = formData.get('leave_request_id') as string | null
    const employee_ai_consent_date = formData.get('employee_ai_consent_date') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // The company this certificate is filed under is derived from the
    // caller's own session/membership below - never trusted from the form
    // field. Uploading a medical certificate is sensitive health-data
    // handling restricted to an admin of the caller's own company, matching
    // medical-certificates/signed-url's model for this same feature.
    const authCheck = await requireCompanyAdmin(request)
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }
    if (authCheck.companyId === undefined) {
      return NextResponse.json({ error: 'Company not found' }, { status: 500 })
    }
    const companyIdNumber = authCheck.companyId

    const entitlement = await hasFeatureAccess(companyIdNumber, 'medicalCertificates.upload')
    if (!entitlement.allowed) {
      return NextResponse.json(entitlementErrorBody('medicalCertificates.upload', entitlement), { status: 403 })
    }

    // Upload file to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const filePath = `certificates/${companyIdNumber}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('medical-certificates')
      .upload(filePath, fileBuffer, { contentType: file.type })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Error uploading file' },
        { status: 500 }
      )
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('medical-certificates')
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      throw new Error("Could not generate signed URL for medical certificate");
      }

const secureUrl = signedUrlData.signedUrl;

    // Insert into database
    const insertData = {
      employee_name,
      absence_start_date: absenceDateStart,
      absence_end_date: absenceDateEnd,
      employee_comment,
      certificate_file: filePath,
      company_id: companyIdNumber,
      leave_request_id: leave_request_id || null,
      treated: false,
      employee_ai_consent_date: employee_ai_consent_date ? new Date(employee_ai_consent_date).toISOString() : null

    }

    const { data: insertedData, error: dbError } = await supabase
      .from('medical_certificates')
      .insert([insertData])
      .select()

    if (dbError) {
      return NextResponse.json(
        { error: 'Error inserting into database', details: dbError.message },
        { status: 500 }
      )
    }

    // If linked to leave request, update it
    if (leave_request_id) {
      await supabase
        .from('leave_requests')
        .update({ 
          is_medical_confirmed: true,
          medical_certificate_id: insertedData[0].id 
        })
        .eq('id', leave_request_id)
    }

    return NextResponse.json({ 
      message: 'Certificate saved successfully!',
      insertedData
    })
  } catch (e) {
    console.error('Server error:', safeErrorInfo(e))
    return NextResponse.json(
      { error: 'Server error', details: (e as Error).message },
      { status: 500 }
    )
  }
}