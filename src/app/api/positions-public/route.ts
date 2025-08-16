import { NextResponse } from "next/server"
import { createServerClient } from "../../../../lib/supabaseServerClient"

export async function GET(req: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    console.log("slug", slug)

    let query = supabase
      .from("openedpositions")
      .select(
        `
        id,
        position_name,
        position_description,
        position_description_detailed,
        company:company(
          company_logo,
          slug
        )
      `
      )
      

    // ⚡ Filtre par slug si fourni
    if (slug) {
      query = query.eq("company.slug", slug)
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ positions: data }, { status: 200 })
  } catch (e) {
    console.error("API error:", e)
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    )
  }
}
