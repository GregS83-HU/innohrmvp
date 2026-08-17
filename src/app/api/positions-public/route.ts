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
        company:company!inner(
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
    // NOTE: the embedded `company` relation needs `!inner` above for this
    // filter to actually restrict rows. Without it, PostgREST performs a
    // left join: the .eq() below is silently dropped, every company's
    // positions come back, and the embedded `company` object is always
    // null (since a plain select doesn't get told which company to embed)
    // - which then fails the `position.company?.slug === companySlug`
    // check everywhere this feeds into (PositionList.tsx), always showing
    // "0 positions available" regardless of what's actually posted.
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