import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import * as XLSX from "xlsx"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Define types for CSV row data
interface CSVRow {
  email?: string
  company_id?: number | string
  is_admin?: boolean | string
  first_name?: string
  firstname?: string
  FirstName?: string
  last_name?: string
  lastname?: string
  LastName?: string
}

// Define result type
interface ImportResult {
  email?: string
  success?: boolean
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Missing CSV/XLSX file" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const rows = XLSX.utils.sheet_to_json<CSVRow>(workbook.Sheets[sheetName])

    const results: ImportResult[] = []

    for (const row of rows) {
      const email = row.email?.toLowerCase()
      const company_id = Number(row.company_id)
      const is_admin = row.is_admin === true || row.is_admin === "true"

      // Read first & last name from CSV
      const first_name = row.first_name || row.firstname || row.FirstName || null
      const last_name = row.last_name || row.lastname || row.LastName || null

      if (!email || !company_id) {
        results.push({ email, error: "Missing email or company_id" })
        continue
      }

      // 1️⃣ Create user in Supabase Auth
      const { data: userData, error: userError } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: false,
        })

      if (userError || !userData?.user) {
        results.push({ email, error: userError?.message })
        continue
      }

      const userId = userData.user.id

      // 2️⃣ Insert into your custom users table (with names)
      const { error: customUserError } = await supabase
        .from("users")
        .insert({
          id: userId,
          is_admin,
          user_firstname: first_name,
          user_lastname: last_name,
        })

      if (customUserError) {
        results.push({ email, error: customUserError.message })
        continue
      }

      // 3️⃣ Link user to company
      const { error: linkError } = await supabase
        .from("company_to_users")
        .insert({
          user_id: userId,
          company_id,
        })

      if (linkError) {
        results.push({ email, error: linkError.message })
        continue
      }

      // 4️⃣ Send magic link invitation
      const { error: inviteError } = await supabase.auth.admin.generateLink({
        type: "invite",
        email,
      })

      if (inviteError) {
        results.push({ email, error: inviteError.message })
        continue
      }

      results.push({ email, success: true })
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error("Import error:", err)
    return NextResponse.json(
      { error: "Failed to import users" },
      { status: 500 }
    )
  }
}