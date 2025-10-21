import { createServerClient } from '../../../../../lib/supabaseServerClient'
import StatsTable from './StatsTable'
import { Analytics } from "@vercel/analytics/next"
import { getServerTranslation } from '../../../../i18n/server-translations'
import { cookies } from 'next/headers'
import { LOCALE_COOKIE } from '../../../../i18n/config'

type Candidat = {
  candidat_firstname: string
  candidat_lastname: string
  cv_text: string
  cv_file: string
  created_at: string
  candidat_email: string
  candidat_phone: string
}

type PositionToCandidatRow = {
  candidat_score: number | null
  candidat_ai_analyse: string | null
  candidat_id: number
  candidat_comment: string | null
  candidat_next_step: string | null
  source: string | null
  candidats: Candidat | null
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ positionId?: string }>
}) {
  // Get locale from cookies
  const cookieStore = await cookies()
  const locale = cookieStore.get(LOCALE_COOKIE)?.value || 'en'
  const t = getServerTranslation(locale)

  const params = await searchParams
  const positionId = params.positionId

  if (!positionId) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{t('statsPage.error.missingPositionId')}</p>
        </div>
      </div>
    )
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('position_to_candidat')
    .select(`
      candidat_score,
      candidat_ai_analyse,
      candidat_id,
      candidat_comment,
      candidat_next_step,
      source,
      candidats (
        candidat_firstname,
        candidat_lastname,
        cv_text,
        cv_file,
        created_at,
        candidat_email,
        candidat_phone
      )
    `)
    .eq('position_id', Number(positionId)) as {
      data: PositionToCandidatRow[] | null
      error: unknown
    }

  if (error) {
    console.error(error)
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{t('statsPage.error.loadingError')}</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-700">{t('statsPage.noCandidates')}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-6">
      <StatsTable rows={data} />
      <Analytics />
    </main>
  )
}