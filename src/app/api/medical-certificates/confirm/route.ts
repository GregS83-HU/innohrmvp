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

    console.log("company_id:", company_id)
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // 🔹 Upload fichier dans Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const filePath = `certificates/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('medical-certificates')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
      })

    if (uploadError) {
      console.error(uploadError)
      return NextResponse.json({ error: 'Error uploading file' }, { status: 500 })
    }

    // 🔹 Récupérer l’URL publique
    const { data: publicUrlData } = supabase.storage
      .from('medical-certificates')
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl

    // 🔹 Insérer les métadonnées en base (avec company_id)
    const { error: dbError } = await supabase.from('medical_certificates').insert([
      {
        employee_name,
        absence_start_date: absenceDateStart,
        absence_end_date: absenceDateEnd,
        employee_comment,
        certificate_file: publicUrl,
        company_id: company_id || null,
      },
    ])

    if (dbError) {
      console.error(dbError)
      return NextResponse.json({ error: 'Error inserting into database' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Certificate saved successfully!' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
