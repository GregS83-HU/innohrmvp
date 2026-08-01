import { NextResponse } from "next/server"
import { createServerClient } from "../../../../lib/supabaseServerClient"

export async function GET(req: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    const now = new Date().toISOString()

    let query = supabase
      .from("openedpositions")
      .select(
        `
        id,
        position_name,
        position_description,
        position_description_detailed,
        position_end_date,
        manager_id,
        company:company(
          company_logo,
          company_name,
          slug
        )
      `
      )
      // Public job board only — exclude positions already closed. Matches the
      // same convention already used in positions-private/route.ts: a null
      // position_end_date means "still open", not "expired".
      .or(`position_end_date.is.null,position_end_date.gt.${now}`)

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