'use client'

import { X, AlertCircle, Users, Clock } from 'lucide-react'
import { useLocale } from 'i18n/LocaleProvider'

interface ConfirmAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCreateWithoutAnalysis: () => void
  candidateCount: number
  loading?: boolean
}

export function ConfirmAnalysisModal({
  isOpen,
  onClose,
  onConfirm,
  onCreateWithoutAnalysis,
  candidateCount,
  loading = false
}: ConfirmAnalysisModalProps) {
  const { t } = useLocale()

  if (!isOpen) return null

  const estimatedMinutes = Math.ceil((candidateCount * 5) / 60)
  const estimatedTime = estimatedMinutes < 1
    ? `${candidateCount * 5} ${t('newPosition.modal.seconds')}`
    : `${estimatedMinutes} ${t('newPosition.modal.minute')}${estimatedMinutes > 1 ? 's' : ''}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        <div className="bg-brand-600 p-6 relative">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
          <AlertCircle className="w-12 h-12 text-white mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white text-center">{t('newPosition.modal.title')}</h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-center">{t('newPosition.modal.message')}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-4 text-center border border-brand-100">
              <Users className="w-6 h-6 text-brand-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-brand-600">{candidateCount}</div>
              <div className="text-xs text-slate-600">{t('newPosition.modal.candidates')}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center border border-brand-100">
              <Clock className="w-6 h-6 text-brand-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-brand-600">{candidateCount}</div>
              <div className="text-xs text-slate-600">{t('newPosition.modal.aiCredits')}</div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 justify-center text-amber-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t('newPosition.modal.estimatedTime')} ~{estimatedTime}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-600 text-center">
              {t('newPosition.modal.willConsume')}{' '}
              <span className="font-semibold text-slate-800">{candidateCount} {t('newPosition.modal.aiCredits')}</span>{' '}
              {t('newPosition.modal.fromAccount')}
            </p>
          </div>
        </div>

        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                {t('newPosition.modal.processing')}
              </>
            ) : (
              t('newPosition.modal.confirmStart')
            )}
          </button>

          <button
            onClick={onCreateWithoutAnalysis}
            disabled={loading}
            className="w-full bg-white text-slate-700 py-3 px-6 rounded-lg font-medium border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('newPosition.modal.createWithoutAnalysis')}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full text-slate-500 py-2 px-6 rounded-lg font-medium hover:text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('newPosition.modal.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}