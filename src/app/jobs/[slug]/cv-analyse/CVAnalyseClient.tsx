'use client'

import { useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Brain,
  BarChart3,
  Shield,
  MessageSquare,
  Download,
  ArrowLeft,
} from 'lucide-react'
import { useLocale } from 'i18n/LocaleProvider'
import Link from 'next/link'

export default function CVAnalyseClient({
  positionName,
  jobDescription,
  jobDescriptionDetailed,
  positionId,
  gdpr_file_url,
  companyName,
}: {
  positionName: string
  jobDescription: string
  jobDescriptionDetailed: string
  positionId: string
  gdpr_file_url: string
  companyName: string
}) {
  const { t } = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const isDemo = pathname.includes('/demo/')

  // Extract company slug from pathname for back navigation
  const companySlug = pathname.split('/')[2] ?? ''

  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState('')
  const [candidateFeedback, setCandidateFeedback] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gdprAccepted, setGdprAccepted] = useState(false)
  const [analysisCompleted, setAnalysisCompleted] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Handle back navigation - simulate browser back button
  const handleBackToPositions = useCallback(() => {
    router.back()
  }, [router])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || (gdpr_file_url && !gdprAccepted) || analysisCompleted) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobDescription', jobDescription)
    formData.append('jobDescriptionDetailed', jobDescriptionDetailed)
    formData.append('positionId', positionId)
    formData.append('companySlug', companySlug)

    setLoading(true)
    setError('')
    setAnalysis('')
    setCandidateFeedback('')
    setScore(null)
    setShowSuccessMessage(false)

    try {
      const res = await fetch('/api/analyse-cv', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        // If server returned a structured error message, show it; otherwise use generic localized message
        throw new Error(data?.error || t('cvAnalyse.messages.error.generic'))
      }

      setAnalysis(data.analysis ?? '')
      setCandidateFeedback(data.candidateFeedback ?? '')
      setScore(typeof data.score === 'number' ? data.score : null)
      setAnalysisCompleted(true)

      // Show success message with small delay for animation
      setTimeout(() => {
        setShowSuccessMessage(true)
      }, 100)
    } catch (err: unknown) {
      console.error('CV Analysis Error:', err)

      // Clear file selection to force re-upload
      setFile(null)
      setGdprAccepted(false)

      // Use structured localized message when possible
      const message =
        err instanceof Error && err.message && err.message !== ''
          ? err.message
          : t('cvAnalyse.messages.error.unableToRead')

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-green-600 bg-green-50 border-green-200'
    if (s >= 5) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreMessage = (s: number) => {
    if (s < 5) {
      return {
        text: t('cvAnalyse.messages.score.low'),
        color: 'text-red-600',
      }
    } else if (s >= 5 && s < 8) {
      return {
        text: t('cvAnalyse.messages.score.medium'),
        color: 'text-orange-600',
      }
    } else {
      return {
        text: t('cvAnalyse.messages.score.high'),
        color: 'text-green-600',
      }
    }
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToPositions}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            aria-label={t('cvAnalyse.buttons.back')}
            title={t('cvAnalyse.buttons.back')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">{t('cvAnalyse.buttons.back')}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
            <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-4" aria-hidden />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4">{t('cvAnalyse.header.title')}</h1>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg inline-block mb-2">
              <span className="font-semibold text-sm sm:text-base">{positionName}</span>
            </div>
            {companyName ? (
              <p className="text-gray-600 text-sm sm:text-base">
                {t('cvAnalyse.header.positionAt')} {companyName}
              </p>
            ) : null}
          </div>
        </div>

        {/* Position Description */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" aria-hidden />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{t('cvAnalyse.sections.positionDescription')}</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{jobDescriptionDetailed}</p>
        </div>

        {/* Demo CVs Download Block */}
        {isDemo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('cvAnalyse.sections.demoTitle')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <a
                href="https://drive.google.com/uc?export=download&id=1-pMKT5dp-8PjJI2RbaVbUNuxt_rxXLFG"
                download
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                title={t('cvAnalyse.sections.demoDownload.software')}
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
                <span className="text-sm sm:text-base">{t('cvAnalyse.sections.demoDownload.software')}</span>
              </a>

              <a
                href="https://drive.google.com/uc?export=download&id=15kzhUQFvizgx1Zhx9MG-CJAhTvHc3gJS"
                download
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                title={t('cvAnalyse.sections.demoDownload.marketing')}
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
                <span className="text-sm sm:text-base">{t('cvAnalyse.sections.demoDownload.marketing')}</span>
              </a>
            </div>

            <p className="text-sm text-gray-700 text-center">
              {t('cvAnalyse.sections.demoSubtitle')}
            </p>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6" aria-label={t('cvAnalyse.forms.uploadForm')}>
            {/* Important Notice */}
            {!analysisCompleted && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" aria-hidden />
                  <p className="text-yellow-800 font-medium text-sm sm:text-base">{t('cvAnalyse.messages.notice')}</p>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <div
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${
                  analysisCompleted ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
                aria-live="polite"
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                  id="cv-upload"
                  disabled={analysisCompleted}
                />
                <label htmlFor="cv-upload" className={analysisCompleted ? 'cursor-not-allowed' : 'cursor-pointer'}>
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" aria-hidden />
                      <span className="text-green-600 font-semibold text-sm sm:text-base break-all px-2">{file.name}</span>
                      {!analysisCompleted && <span className="text-xs sm:text-sm text-gray-500">{t('cvAnalyse.labels.clickToChange')}</span>}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" aria-hidden />
                      <span className={`font-semibold text-sm sm:text-base ${analysisCompleted ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}>
                        {t('cvAnalyse.labels.clickToSelect')}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">{t('cvAnalyse.labels.pdfOnly')}</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* GDPR Checkbox */}
            {file && !analysisCompleted && gdpr_file_url && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="gdpr"
                    type="checkbox"
                    checked={gdprAccepted}
                    onChange={(e) => setGdprAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                    disabled={analysisCompleted}
                  />
                  <label htmlFor="gdpr" className="text-xs sm:text-sm text-gray-700 flex-1">
                    <Shield className="w-4 h-4 inline mr-1" aria-hidden />
                    {t('cvAnalyse.messages.gdprPre')}{' '}
                    <a
                      href={gdpr_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-700"
                    >
                      {t('cvAnalyse.messages.gdprLinkText')}
                    </a>
                    {t('cvAnalyse.messages.gdprPost')}
                  </label>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || (gdpr_file_url && !gdprAccepted) || loading || analysisCompleted}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-white text-base sm:text-lg transition-all shadow-md hover:shadow-lg transform ${
                loading || !file || (gdpr_file_url && !gdprAccepted) || analysisCompleted
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
              }`}
              aria-disabled={!file || (gdpr_file_url && !gdprAccepted) || loading || analysisCompleted}
            >
              {analysisCompleted ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
                  <span>{t('cvAnalyse.buttons.completed')}</span>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full" aria-hidden />
                  <span>{t('cvAnalyse.buttons.analyzing')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
                  <span>{t('cvAnalyse.buttons.analyze')}</span>
                </div>
              )}
            </button>

            {/* Success Message - Now positioned below the button */}
            {showSuccessMessage && analysisCompleted && (
              <div
                className={`transition-all duration-500 ease-out transform ${showSuccessMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                role="status"
                aria-live="polite"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" aria-hidden />
                    <p className="text-green-800 font-medium text-sm sm:text-base">{t('cvAnalyse.messages.success')}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 animate-fade-in" role="alert">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" aria-hidden />
              <div>
                <h3 className="font-semibold text-red-700 text-sm sm:text-base">{t('cvAnalyse.messages.error.title')}</h3>
                <p className="text-red-600 text-sm sm:text-base">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {score !== null && candidateFeedback && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in" aria-live="polite">
            {/* Score Card */}
            <div className={`rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 border-2 ${getScoreColor(score)}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
                  <h2 className="text-lg sm:text-xl font-semibold">{t('cvAnalyse.sections.scoreTitle')}</h2>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-center sm:text-right">{score}/10</div>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border ${getScoreMessage(score).color.replace('text-', 'border-').replace('-600', '-200')} bg-white`}>
                <p className={`font-semibold text-sm sm:text-base ${getScoreMessage(score).color}`}>{getScoreMessage(score).text}</p>
              </div>
            </div>

            {/* Candidate Feedback */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" aria-hidden />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{t('cvAnalyse.sections.feedbackTitle')}</h2>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 leading-relaxed">{candidateFeedback}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  )
}
