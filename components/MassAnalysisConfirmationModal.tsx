import { X, AlertCircle, Clock, Users } from 'lucide-react'
import { useLocale } from 'i18n/LocaleProvider'

interface ConfirmAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCreateWithoutAnalysis: () => void
  candidateCount: number
  loading?: boolean
}

export default function ConfirmAnalysisModal({
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
  
  const getEstimatedTime = () => {
    if (estimatedMinutes < 1) {
      return t('confirmAnalysisModal.content.timeFormat.seconds', { count: candidateCount * 5 })
    }
    return estimatedMinutes === 1
      ? t('confirmAnalysisModal.content.timeFormat.minute', { count: estimatedMinutes })
      : t('confirmAnalysisModal.content.timeFormat.minutes', { count: estimatedMinutes })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
          <AlertCircle className="w-12 h-12 text-white mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white text-center">
            {t('confirmAnalysisModal.header.title')}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-center">
            {t('confirmAnalysisModal.content.description')}
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-100">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{candidateCount}</div>
              <div className="text-xs text-gray-600">
                {t('confirmAnalysisModal.content.stats.candidates')}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center border border-purple-100">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{candidateCount}</div>
              <div className="text-xs text-gray-600">
                {t('confirmAnalysisModal.content.stats.aiCredits')}
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 justify-center text-amber-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t('confirmAnalysisModal.content.estimatedTime', { time: getEstimatedTime() })}
              </span>
            </div>
          </div>

          {/* Warning Text */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              {t('confirmAnalysisModal.content.warning', { count: candidateCount })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                {t('confirmAnalysisModal.actions.processing')}
              </>
            ) : (
              t('confirmAnalysisModal.actions.confirm')
            )}
          </button>
          
          <button
            onClick={onCreateWithoutAnalysis}
            disabled={loading}
            className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('confirmAnalysisModal.actions.createWithout')}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full text-gray-500 py-2 px-6 rounded-lg font-medium hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('confirmAnalysisModal.actions.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}