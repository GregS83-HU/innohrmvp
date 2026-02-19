'use client'

import { Plus, Briefcase, FileText, Calendar, Activity, MapPin, Sparkles, User } from 'lucide-react'
import { ManagerDropdown, CompanyUser } from './ManagerDropdown'
import { useLocale } from 'i18n/LocaleProvider'

// --- Salary input with thousands separator ---

function formatWithThousands(raw: string): string {
  // Strip non-numeric except for leading minus (if you ever need negative)
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('fr-FR')
}

function unformat(formatted: string): string {
  return formatted.replace(/,/g, '')
}

interface SalaryInputProps {
  value: string          // stored as raw numeric string e.g. "1500000"
  onChange: (raw: string) => void
  placeholder?: string
  className?: string
}

function SalaryInput({ value, onChange, placeholder = '0', className = '' }: SalaryInputProps) {
  const displayed = value ? formatWithThousands(value) : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = unformat(e.target.value)
    if (raw === '' || /^\d+$/.test(raw)) {
      onChange(raw)
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayed}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  )
}

// --- Types ---

export interface PositionFormData {
  positionName: string
  selectedManager: CompanyUser | null
  positionDescription: string
  positionDescriptionDetailed: string
  positionStartDate: string
  location: string
  locationType: 'onsite' | 'hybrid' | 'remote' | ''
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary' | ''
  salaryMin: string
  salaryMax: string
  salaryCurrency: string
  salaryPublic: boolean
  applicationDeadline: string
}

interface PositionFormProps {
  data: PositionFormData
  onChange: <K extends keyof PositionFormData>(field: K, value: PositionFormData[K]) => void
  onSubmit: (e: React.FormEvent) => void
  onOpenAIModal: () => void
  companyId: string | null
  loading: boolean
  aiGenerating: boolean
  setMessage: (msg: { text: string; type: 'error' | 'success' } | null) => void
}

export function PositionForm({
  data,
  onChange,
  onSubmit,
  onOpenAIModal,
  companyId,
  loading,
  aiGenerating,
  setMessage,
}: PositionFormProps) {
  const { t } = useLocale()

  const handleAIClick = () => {
    if (!data.positionName.trim()) {
      setMessage({ text: t('newPosition.messages.positionNameRequired'), type: 'error' })
      return
    }
    onOpenAIModal()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <form onSubmit={onSubmit} className="space-y-6">

          {/* Position Name */}
          <div>
            <label htmlFor="positionName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Briefcase className="w-4 h-4" />
              {t('newPosition.form.positionName')}
            </label>
            <input
              id="positionName"
              type="text"
              value={data.positionName}
              onChange={(e) => onChange('positionName', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t('newPosition.form.positionNamePlaceholder')}
            />
          </div>

          {/* Manager */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <User className="w-4 h-4" />
              {t('newPosition.form.manager')} <span className="text-red-500">*</span>
            </label>
            {companyId ? (
              <ManagerDropdown
                selectedManager={data.selectedManager}
                onSelect={(m) => onChange('selectedManager', m)}
                companyId={companyId}
                t={(key) => t(`newPosition.${key}`)}
              />
            ) : (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-400">
                {t('managerDropdown.loadingManagers')}
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {t('newPosition.form.locationTitle')}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('newPosition.form.location')}
                </label>
                <input
                  id="location"
                  type="text"
                  value={data.location}
                  onChange={(e) => onChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('newPosition.form.locationPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('newPosition.form.locationType')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['onsite', 'hybrid', 'remote'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onChange('locationType', type)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        data.locationType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {t(`newPosition.form.locationTypes.${type}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('newPosition.form.employmentType')} <span className="text-red-500">*</span>
            </label>
            <select
              value={data.employmentType}
              onChange={(e) => onChange('employmentType', e.target.value as PositionFormData['employmentType'])}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">{t('newPosition.form.selectEmploymentType')}</option>
              <option value="full-time">{t('newPosition.form.employmentTypes.fullTime')}</option>
              <option value="part-time">{t('newPosition.form.employmentTypes.partTime')}</option>
              <option value="contract">{t('newPosition.form.employmentTypes.contract')}</option>
              <option value="internship">{t('newPosition.form.employmentTypes.internship')}</option>
              <option value="temporary">{t('newPosition.form.employmentTypes.temporary')}</option>
            </select>
          </div>

          {/* Salary Range */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('newPosition.form.salaryRange')}{' '}
                <span className="text-gray-400 text-xs">({t('newPosition.form.optional')})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.salaryPublic}
                  onChange={(e) => onChange('salaryPublic', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">{t('newPosition.form.showPublicly')}</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('newPosition.form.min')}</label>
                <SalaryInput
                  value={data.salaryMin}
                  onChange={(raw) => onChange('salaryMin', raw)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('newPosition.form.max')}</label>
                <SalaryInput
                  value={data.salaryMax}
                  onChange={(raw) => onChange('salaryMax', raw)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('newPosition.form.currency')}</label>
                <select
                  value={data.salaryCurrency}
                  onChange={(e) => onChange('salaryCurrency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HUF">HUF</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="CZK">CZK</option>
                  <option value="PLN">PLN</option>
                  <option value="RON">RON</option>
                  <option value="GBP">GBP</option>
                  <option value="CHF">CHF</option>
                </select>
              </div>
            </div>
          </div>

          {/* Application Deadline */}
          <div>
            <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
              {t('newPosition.form.applicationDeadline')}{' '}
              <span className="text-gray-400 text-xs">({t('newPosition.form.optional')})</span>
            </label>
            <input
              id="applicationDeadline"
              type="date"
              value={data.applicationDeadline}
              onChange={(e) => onChange('applicationDeadline', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* AI Generation Section */}
          <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">{t('newPosition.aiSection.title')}</h3>
              </div>
              <span className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">AI</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t('newPosition.aiSection.description')}</p>
            <button
              type="button"
              onClick={handleAIClick}
              disabled={aiGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Sparkles className="w-5 h-5" />
              {t('newPosition.aiSection.generateButton')}
            </button>
          </div>

          {/* Short Description */}
          <div>
            <label htmlFor="positionDescription" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <FileText className="w-4 h-4" />
              {t('newPosition.form.positionDescription')}
            </label>
            <textarea
              id="positionDescription"
              value={data.positionDescription}
              onChange={(e) => onChange('positionDescription', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={4}
              placeholder={t('newPosition.form.positionDescriptionPlaceholder')}
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label htmlFor="positionDescriptionDetailed" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Activity className="w-4 h-4" />
              {t('newPosition.form.positionDescriptionDetailed')}
            </label>
            <textarea
              id="positionDescriptionDetailed"
              value={data.positionDescriptionDetailed}
              onChange={(e) => onChange('positionDescriptionDetailed', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={4}
              placeholder={t('newPosition.form.positionDescriptionDetailedPlaceholder')}
            />
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="positionStartDate" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Calendar className="w-4 h-4" />
              {t('newPosition.form.startingDate')}
            </label>
            <input
              id="positionStartDate"
              type="date"
              value={data.positionStartDate}
              onChange={(e) => onChange('positionStartDate', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                {t('newPosition.buttons.creating')}
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                {t('newPosition.buttons.createPosition')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}