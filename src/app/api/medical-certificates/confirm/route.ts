// /api/medical-certificates/confirm/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const company_id = formData.get('company_id') as string | null

    // 🔹 DEBUG: Log des valeurs reçues
    console.log('=== DEBUG CONFIRM ROUTE ===')
    console.log('employee_name:', employee_name)
    console.log('absenceDateStart:', absenceDateStart)
    console.log('absenceDateEnd:', absenceDateEnd)
    console.log('employee_comment:', employee_comment)
    console.log('company_id (raw):', company_id)
    console.log('company_id type:', typeof company_id)
    console.log('=========================')

    if (!company_id) {
      console.error('❌ company_id is missing or null')
      return NextResponse.json(
        { error: 'Missing company_id' },
        { status: 400 }
      )
    }

    if (!file) {
      console.error('❌ file is missing or null')
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // 🔹 Validation et conversion du company_id
    const companyIdNumber = parseInt(company_id, 10)
    if (isNaN(companyIdNumber)) {
      console.error('❌ company_id cannot be converted to number:', company_id)
      return NextResponse.json(
        { error: 'Invalid company_id format' },
        { status: 400 }
      )
    }

    console.log('✅ company_id converted to number:', companyIdNumber)

    // 🔹 Upload fichier dans Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const filePath = `certificates/${company_id}/${Date.now()}-${file.name}` // Inclure company_id dans le chemin

    const { error: uploadError } = await supabase.storage
      .from('medical-certificates')
      .upload(filePath, fileBuffer, { contentType: file.type })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Error uploading file' },
        { status: 500 }
      )
    }

    console.log('✅ File uploaded successfully:', filePath)

    // 🔹 Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from('medical-certificates')
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl
    console.log('✅ Public URL generated:', publicUrl)

    // 🔹 Préparer les données pour l'insertion
    const insertData = {
      employee_name,
      absence_start_date: absenceDateStart,
      absence_end_date: absenceDateEnd,
      employee_comment,
      certificate_file: publicUrl,
      company_id: companyIdNumber,
    }

    console.log('📝 Data to insert:', JSON.stringify(insertData, null, 2))

    // 🔹 Insérer les métadonnées en base
    const { data: insertedData, error: dbError } = await supabase
      .from('medical_certificates')
      .insert([insertData])
      .select() // Récupérer les données insérées pour vérification

    if (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json(
        { error: 'Error inserting into database', details: dbError.message },
        { status: 500 }
      )
    }

    console.log('✅ Data inserted successfully:', insertedData)

    return NextResponse.json({ 
      message: 'Certificate saved successfully!',
      insertedData // Temporaire pour debugging
    })
  } catch (e) {
    console.error('❌ Server error:', e)
    return NextResponse.json(
      { error: 'Server error', details: (e as Error).message },
      { status: 500 }
    )
  }
}