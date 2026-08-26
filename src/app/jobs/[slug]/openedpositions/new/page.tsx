'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, BarChart3, CheckCircle, AlertCircle, Activity, Lock } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useLocale } from 'i18n/LocaleProvider'

import { PositionForm, PositionFormData } from '../../../../../../components/newposition/PositionForm'
import { AIGenerateModal } from '../../../../../../components/newposition/AIGenerateModal'
import { ConfirmAnalysisModal } from '../../../../../../components/newposition//ConfirmAnalysisModal'
import { safeErrorInfo } from '../../../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DEFAULT_FORM: PositionFormData = {
  positionName: '',
  selectedManager: null,
  positionDescription: '',
  positionDescriptionDetailed: '',
  positionStartDate: '',
  location: '',
  locationType: '',
  employmentType: '',
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: 'HUF',
  salaryPublic: false,
  applicationDeadline: '',
}

export default function NewOpenedPositionPage() {
  const { t } = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const session = useSession()

  // Form state (single object, easy to reset)
  const [form, setForm] = useState<PositionFormData>(DEFAULT_FORM)
  const setField = <K extends keyof PositionFormData>(field: K, value: PositionFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // UI / async state
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [positionId, setPositionId] = useState<string | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{ matched: number; total: number } | null>(null)
  const [progress, setProgress] = useState(0)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [canCreatePosition, setCanCreatePosition] = useState<boolean | null>(null)
  const positionAccessChecked = useRef(false)

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [candidateCount, setCandidateCount] = useState(0)
  const [fetchingCount, setFetchingCount] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)

  // Auth guard
  useEffect(() => {
    if (!session) router.push('/')
  }, [session, router])

  // Fetch company id
  const fetchUserCompanyId = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', userId)
        .single()
      if (!error && data?.company_id) setCompanyId(data.company_id)
    } catch (e) {
      console.error('Error in fetchUserCompanyId:', safeErrorInfo(e))
    }
  }, [])

  // Check position creation quota
  const checkPositionCreationAccess = useCallback(async () => {
    if (!companyId || positionAccessChecked.current) return
    positionAccessChecked.current = true
    try {
      const res = await fetch(`/api/entitlements/check?company_id=${companyId}&feature=recruitment.openPosition`)
      const result = await res.json()
      setCanCreatePosition(res.ok && result.allowed === true)
    } catch {
      setCanCreatePosition(false)
    }
  }, [companyId])

  useEffect(() => {
    if (session?.user?.id) fetchUserCompanyId(session.user.id)
  }, [session?.user?.id, fetchUserCompanyId])

  useEffect(() => {
    if (companyId) checkPositionCreationAccess()
  }, [companyId, checkPositionCreationAccess])

  // --- Handlers ---

  const handleAIGenerate = async (roughDraft: string) => {
    if (!companyId) {
      setMessage({ text: t('newPosition.messages.errorCompanyId'), type: 'error' })
      return
    }
    setAiGenerating(true)
    setMessage(null)
    try {
      const res = await fetch('/api/generate-position-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roughDraft, positionName: form.positionName, companyId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({
          text: res.status === 402
            ? t('newPosition.messages.noCredits')
            : data.error || t('newPosition.messages.aiGenerationFailed'),
          type: 'error',
        })
      } else {
        setField('positionDescription', data.position_description)
        setField('positionDescriptionDetailed', data.position_description_detailed)
        setMessage({ text: t('newPosition.messages.aiGenerationSuccess'), type: 'success' })
        setShowAIModal(false)
      }
    } catch (error) {
      setMessage({ text: `${t('newPosition.messages.unexpectedError')} ${(error as Error).message}`, type: 'error' })
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setAnalysisResult(null)

    if (!form.selectedManager) {
      setMessage({ text: t('newPosition.messages.selectManager'), type: 'error' })
      return
    }
    if (!form.employmentType) {
      setMessage({ text: t('newPosition.messages.selectEmploymentType'), type: 'error' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/new-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session!.user.id,
          id: positionId,
          position_name: form.positionName,
          manager_id: form.selectedManager.user_id,
          position_description: form.positionDescription,
          position_description_detailed: form.positionDescriptionDetailed,
          position_start_date: form.positionStartDate,
          location: form.location || null,
          location_type: form.locationType || null,
          employment_type: form.employmentType || null,
          salary_min: form.salaryMin ? parseFloat(form.salaryMin) : null,
          salary_max: form.salaryMax ? parseFloat(form.salaryMax) : null,
          salary_currency: form.salaryCurrency,
          salary_public: form.salaryPublic,
          application_deadline: form.applicationDeadline || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ text: data.error || t('newPosition.messages.errorCreating'), type: 'error' })
      } else {
        setMessage({ text: t('newPosition.messages.successCreated'), type: 'success' })
        setPositionId(data.id)
        setForm(DEFAULT_FORM)
      }
    } catch (error) {
      setMessage({ text: `${t('newPosition.messages.unexpectedError')} ${(error as Error).message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyseClick = async () => {
    setFetchingCount(true)
    try {
      const res = await fetch(`/api/candidate-count?user_id=${session!.user.id}`)
      const data = await res.json()
      if (!res.ok) {
        setMessage({ text: t('newPosition.messages.errorFetchingCount'), type: 'error' })
        return
      }
      const count = data.count || 0
      if (count === 0) {
        setMessage({ text: t('newPosition.messages.noCandidates'), type: 'error' })
        return
      }
      setCandidateCount(count)
      setShowConfirmModal(true)
    } catch {
      setMessage({ text: t('newPosition.messages.unexpectedErrorRetry'), type: 'error' })
    } finally {
      setFetchingCount(false)
    }
  }

  const handleAnalyseMassive = async () => {
    if (!positionId) return
    setShowConfirmModal(false)
    setAnalysisLoading(true)
    setAnalysisResult(null)
    setMessage(null)
    setProgress(0)
    try {
      const es = new EventSource(
        `/api/analyse-massive?position_id=${positionId}&user_id=${session!.user.id}&company_id=${companyId}`
      )
      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'progress') {
          setProgress(data.progress)
        } else if (data.type === 'done') {
          setAnalysisResult({ matched: data.matched, total: data.total })
          setMessage({
            text: `${t('newPosition.messages.analysisComplete')} ${data.matched} / ${data.total} ${t('newPosition.messages.candidatesCorresponding')}`,
            type: 'success',
          })
          setAnalysisLoading(false)
          es.close()
        } else if (data.type === 'error') {
          setMessage({ text: data.error, type: 'error' })
          setAnalysisLoading(false)
          es.close()
        }
      }
      es.onerror = () => {
        setMessage({ text: t('newPosition.messages.serverError'), type: 'error' })
        setAnalysisLoading(false)
        es.close()
      }
    } catch (error) {
      setMessage({ text: `${t('newPosition.messages.unexpectedError')} ${(error as Error).message}`, type: 'error' })
      setAnalysisLoading(false)
    }
  }

  const handleCreateWithoutAnalysis = () => {
    setShowConfirmModal(false)
    setMessage({ text: t('newPosition.messages.createdRunLater'), type: 'success' })
  }

  // --- Loading / access gate ---
  if (!session || canCreatePosition === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!session ? t('newPosition.loading.userInfo') : t('newPosition.loading.checkingLimits')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
            <Plus className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              {t('newPosition.header.title')}
            </h1>
            <p className="text-gray-600">{t('newPosition.header.subtitle')}</p>
          </div>
        </div>

        {/* Limit reached banner */}
        {canCreatePosition === false && (
          <div className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">{t('newPosition.limitReached.title')}</h3>
              <p className="text-red-700 mb-6">{t('newPosition.limitReached.message')}</p>
              <button
                className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 px-8 rounded-lg font-medium hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                onClick={() => console.log('Redirect to upgrade page')}
              >
                {t('newPosition.limitReached.upgradeButton')}
              </button>
            </div>
          </div>
        )}

        {canCreatePosition === true && (
          <>
            {/* Main Form */}
            <PositionForm
              data={form}
              onChange={setField}
              onSubmit={handleSubmit}
              onOpenAIModal={() => setShowAIModal(true)}
              companyId={companyId}
              loading={loading}
              aiGenerating={aiGenerating}
              setMessage={setMessage}
            />

            {/* Message banner */}
            {message && (
              <div className={`rounded-2xl p-4 sm:p-6 ${
                message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            {/* Analysis launcher */}
            {positionId && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                    <Activity className="w-5 h-5" />
                    {t('newPosition.analysis.title')}
                  </h3>
                  <button
                    onClick={handleAnalyseClick}
                    disabled={analysisLoading || fetchingCount}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
                  >
                    {fetchingCount ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        {t('newPosition.analysis.loading')}
                      </>
                    ) : analysisLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        {t('newPosition.analysis.running')}
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5" />
                        {t('newPosition.analysis.launchButton')}
                      </>
                    )}
                  </button>
                  {analysisLoading && (
                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analysis results */}
            {analysisResult && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                    <BarChart3 className="w-5 h-5" />
                    {t('newPosition.results.title')}
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {analysisResult.matched} / {analysisResult.total}
                      </div>
                      <p className="text-gray-600">{t('newPosition.results.matchingCandidates')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const basePath = pathname.split('/openedpositions')[0]
                      router.push(`${basePath}/stats?positionId=${positionId}`)
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    <BarChart3 className="w-5 h-5" />
                    {t('newPosition.results.viewDetails')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AIGenerateModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleAIGenerate}
        positionName={form.positionName}
        loading={aiGenerating}
      />
      <ConfirmAnalysisModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleAnalyseMassive}
        onCreateWithoutAnalysis={handleCreateWithoutAnalysis}
        candidateCount={candidateCount}
        loading={analysisLoading}
      />
    </main>
  )
}