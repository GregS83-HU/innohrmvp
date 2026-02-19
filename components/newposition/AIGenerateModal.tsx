'use client'

import { useState } from 'react'
import { X, Sparkles, Wand2, AlertCircle } from 'lucide-react'
import { useLocale } from 'i18n/LocaleProvider'

interface AIGenerateModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (roughDraft: string) => void
  positionName: string
  loading?: boolean
}

export function AIGenerateModal({ isOpen, onClose, onGenerate, positionName, loading = false }: AIGenerateModalProps) {
  const { t } = useLocale()
  const [roughDraft, setRoughDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleGenerate = () => {
    if (roughDraft.trim().length < 20) {
      setError(t('newPosition.aiModal.minLengthError'))
      return
    }
    setError(null)
    onGenerate(roughDraft)
  }

  const handleClose = () => {
    if (!loading) {
      setRoughDraft('')
      setError(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 transform transition-all">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 relative">
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
            <Sparkles className="w-12 h-12 text-white mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white text-center">{t('newPosition.aiModal.title')}</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-start gap-3">
                <Wand2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-purple-900">
                  <p className="font-medium mb-1">{t('newPosition.aiModal.instructions')}</p>
                  <ul className="list-disc list-inside space-y-1 text-purple-800">
                    <li>{t('newPosition.aiModal.instruction1')}</li>
                    <li>{t('newPosition.aiModal.instruction2')}</li>
                    <li>{t('newPosition.aiModal.instruction3')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {positionName && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{t('newPosition.aiModal.generatingFor')}</span> {positionName}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="roughDraft" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('newPosition.aiModal.roughDraftLabel')}
              </label>
              <textarea
                id="roughDraft"
                value={roughDraft}
                onChange={(e) => setRoughDraft(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                rows={8}
                placeholder={t('newPosition.aiModal.roughDraftPlaceholder')}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {roughDraft.length} {t('newPosition.aiModal.characters')} (min. 20)
                </p>
                {error && <p className="text-xs text-red-600">{error}</p>}
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{t('newPosition.aiModal.creditWarning')}</span>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-3">
            <button
              onClick={handleGenerate}
              disabled={loading || roughDraft.trim().length < 20}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  {t('newPosition.aiModal.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {t('newPosition.aiModal.generateButton')}
                </>
              )}
            </button>
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-full text-gray-500 py-2 px-6 rounded-lg font-medium hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('newPosition.aiModal.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}