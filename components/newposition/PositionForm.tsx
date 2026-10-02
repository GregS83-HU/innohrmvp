'use client'

import { Plus, Briefcase, FileText, Calendar, Activity, MapPin, Sparkles, User, MessageSquare, Clock, Hourglass, FileSignature, GraduationCap, CalendarClock, Wallet, Eye, EyeOff } from 'lucide-react'
import { ManagerDropdown, CompanyUser } from './ManagerDropdown'
import { useLocale } from 'i18n/LocaleProvider'
import { CANDIDATE_FEEDBACK_TONES, CandidateFeedbackTone } from '../../lib/candidateFeedbackTone'

// --- Salary input with thousands separator ---

function formatWithThousands(raw: string): string {
  // Strip non-numeric except for leading minus (if you ever need negative)
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('fr-FR')
}

function unformat(formatted: string): string {
  // fr-FR groups with a narrow no-break space, so strip every separator, not just commas
  return formatted.replace(/\D/g, '')
}

const SALARY_CURRENCIES = ['HUF', 'EUR', 'USD', 'CZK', 'PLN', 'RON', 'GBP', 'CHF'] as const

interface SalaryInputProps {
  value: string          // stored as raw numeric string e.g. "1500000"
  onChange: (raw: string) => void
  placeholder?: string
  className?: string
  ariaLabel?: string
}

function SalaryInput({ value, onChange, placeholder = '0', className = '', ariaLabel }: SalaryInputProps) {
  const displayed = value ? formatWithThousands(value) : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(unformat(e.target.value))
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayed}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      aria-label={ariaLabel}
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
  candidateFeedbackTone: CandidateFeedbackTone
}

export function isSalaryRangeInvalid(data: Pick<PositionFormData, 'salaryMin' | 'salaryMax'>): boolean {
  return !!data.salaryMin && !!data.salaryMax && Number(data.salaryMin) > Number(data.salaryMax)
}

const EMPLOYMENT_TYPES = [
  { value: 'full-time', labelKey: 'fullTime', Icon: Briefcase },
  { value: 'part-time', labelKey: 'partTime', Icon: Hourglass },
  { value: 'contract', labelKey: 'contract', Icon: FileSignature },
  { value: 'internship', labelKey: 'internship', Icon: GraduationCap },
  { value: 'temporary', labelKey: 'temporary', Icon: CalendarClock },
] as const

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

  const salaryRangeInvalid = isSalaryRangeInvalid(data)

  const renderSalaryField = (field: 'salaryMin' | 'salaryMax', labelKey: 'min' | 'max') => (
    <div>
      <span className="block text-xs font-medium text-gray-500 mb-1">{t(`newPosition.form.${labelKey}`)}</span>
      <div className="relative">
        <SalaryInput
          value={data[field]}
          onChange={(raw) => onChange(field, raw)}
          placeholder="0"
          ariaLabel={t(`newPosition.form.${labelKey}`)}
          className={`w-full pl-3 pr-12 py-3 bg-white border rounded-lg font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            salaryRangeInvalid ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
          {data.salaryCurrency}
        </span>
      </div>
    </div>
  )

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
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Clock className="w-4 h-4" />
              {t('newPosition.form.employmentType')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" role="radiogroup">
              {EMPLOYMENT_TYPES.map(({ value, labelKey, Icon }) => {
                const selected = data.employmentType === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange('employmentType', value)}
                    className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-lg border-2 font-medium text-sm transition-all ${
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${selected ? 'text-blue-600' : 'text-gray-400'}`} />
                    {t(`newPosition.form.employmentTypes.${labelKey}`)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Wallet className="w-4 h-4" />
              {t('newPosition.form.salaryRange')}{' '}
              <span className="text-gray-400 text-xs font-normal">({t('newPosition.form.optional')})</span>
            </label>

            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-4">
              {/* Currency */}
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('newPosition.form.currency')}>
                {SALARY_CURRENCIES.map((cur) => {
                  const selected = data.salaryCurrency === cur
                  return (
                    <button
                      key={cur}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onChange('salaryCurrency', cur)}
                      className={`px-3 py-1.5 rounded-full border-2 text-xs font-semibold tracking-wide transition-all ${
                        selected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {cur}
                    </button>
                  )
                })}
              </div>

              {/* Min — Max */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 sm:gap-3">
                {renderSalaryField('salaryMin', 'min')}
                <span className="pb-3 text-gray-400 font-medium">–</span>
                {renderSalaryField('salaryMax', 'max')}
              </div>
              {salaryRangeInvalid && (
                <p className="text-xs text-red-600 -mt-2">{t('newPosition.form.salaryMinAboveMax')}</p>
              )}

              {/* Visibility */}
              <button
                type="button"
                role="switch"
                aria-checked={data.salaryPublic}
                onClick={() => onChange('salaryPublic', !data.salaryPublic)}
                className={`w-full flex items-center gap-3 rounded-lg border-2 px-3 py-3 text-left transition-all ${
                  data.salaryPublic ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {data.salaryPublic ? (
                  <Eye className="w-5 h-5 shrink-0 text-blue-600" />
                ) : (
                  <EyeOff className="w-5 h-5 shrink-0 text-gray-400" />
                )}
                <span className="flex-1 min-w-0">
                  <span className={`block text-sm font-medium ${data.salaryPublic ? 'text-blue-700' : 'text-gray-700'}`}>
                    {t('newPosition.form.showPublicly')}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {t(data.salaryPublic ? 'newPosition.form.salaryPublicOn' : 'newPosition.form.salaryPublicOff')}
                  </span>
                </span>
                <span
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                    data.salaryPublic ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      data.salaryPublic ? 'translate-x-5' : ''
                    }`}
                  />
                </span>
              </button>
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

          {/* Candidate Feedback Tone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
              <MessageSquare className="w-4 h-4" />
              {t('newPosition.form.feedbackTone.title')}
            </label>
            <p className="text-xs text-gray-500 mb-3">{t('newPosition.form.feedbackTone.help')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CANDIDATE_FEEDBACK_TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => onChange('candidateFeedbackTone', tone)}
                  aria-pressed={data.candidateFeedbackTone === tone}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    data.candidateFeedbackTone === tone
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {t(`newPosition.form.feedbackTone.levels.${tone}.label`)}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              {t(`newPosition.form.feedbackTone.levels.${data.candidateFeedbackTone}.description`)}
            </p>
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