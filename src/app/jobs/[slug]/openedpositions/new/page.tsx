'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Calendar, FileText, Briefcase, BarChart3, CheckCircle, AlertCircle, Activity, Lock, X, Clock, Users, ChevronDown, Search, User } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useLocale } from 'i18n/LocaleProvider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CompanyUser {
  user_id: string
  first_name: string
  last_name: string
  email: string
  is_admin: boolean
  is_super_admin: boolean
  is_manager: boolean
  manager_id: string | null
  manager_first_name: string | null
  manager_last_name: string | null
  employment_start_date: string | null
}

interface ManagerDropdownProps {
  selectedManager: CompanyUser | null
  onSelect: (manager: CompanyUser | null) => void
  companyId: string
  t: any
}

function ManagerDropdown({ selectedManager, onSelect, companyId, t }: ManagerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [managers, setManagers] = useState<CompanyUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchManagers = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { data, error } = await supabase
          .rpc('get_company_users', { company_id_input: companyId })
        
        if (error) {
          console.error('Error fetching company users:', error)
          setError('Error loading users. Please contact your admin.')
          setManagers([])
          return
        }
        
        if (!data || data.length === 0) {
          setError('No users found. Please contact your admin.')
          setManagers([])
          return
        }
        
        setManagers(data)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Error loading users. Please contact your admin.')
        setManagers([])
      } finally {
        setLoading(false)
      }
    }

    if (companyId) {
      fetchManagers()
    }
  }, [companyId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredManagers = managers.filter(manager => {
    const fullName = `${manager.first_name} ${manager.last_name}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })

  const handleSelect = (manager: CompanyUser) => {
    onSelect(manager)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(null)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between bg-white"
      >
        <span className={selectedManager ? 'text-gray-900' : 'text-gray-400'}>
          {selectedManager 
            ? `${selectedManager.first_name} ${selectedManager.last_name}`
            : 'Select a manager...'
          }
        </span>
        <div className="flex items-center gap-2">
          {selectedManager && (
            <X 
              className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" 
              onClick={handleClear}
            />
          )}
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-48">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600 text-sm">
                {error}
              </div>
            ) : filteredManagers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No users found
              </div>
            ) : (
              filteredManagers.map((manager) => (
                <button
                  key={manager.user_id}
                  type="button"
                  onClick={() => handleSelect(manager)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {manager.first_name} {manager.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{manager.email}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface ConfirmAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCreateWithoutAnalysis: () => void
  candidateCount: number
  loading?: boolean
}

function ConfirmAnalysisModal({
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
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
            {t('newPosition.modal.title')}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-center">
            {t('newPosition.modal.message')}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-100">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{candidateCount}</div>
              <div className="text-xs text-gray-600">{t('newPosition.modal.candidates')}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center border border-purple-100">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{candidateCount}</div>
              <div className="text-xs text-gray-600">{t('newPosition.modal.aiCredits')}</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 justify-center text-amber-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t('newPosition.modal.estimatedTime')} ~{estimatedTime}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              {t('newPosition.modal.willConsume')} <span className="font-semibold text-gray-800">{candidateCount} {t('newPosition.modal.aiCredits')}</span> {t('newPosition.modal.fromAccount')}
            </p>
          </div>
        </div>

        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
            className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('newPosition.modal.createWithoutAnalysis')}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full text-gray-500 py-2 px-6 rounded-lg font-medium hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('newPosition.modal.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NewOpenedPositionPage() {
  const { t } = useLocale()
  const router = useRouter()
  const session = useSession()

  const [positionName, setPositionName] = useState('')
  const [selectedManager, setSelectedManager] = useState<CompanyUser | null>(null)
  const [positionDescription, setPositionDescription] = useState('')
  const [positionDescriptionDetailed, setPositionDescriptionDetailed] = useState('')
  const [positionStartDate, setPositionStartDate] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [positionId, setPositionId] = useState<string | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{ matched: number; total: number } | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [canCreatePosition, setCanCreatePosition] = useState<boolean | null>(null)
  const positionAccessChecked = useRef(false)
  const pathname = usePathname()

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [candidateCount, setCandidateCount] = useState(0)
  const [fetchingCount, setFetchingCount] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  const fetchUserCompanyId = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching company_id:', error);
        return;
      }
      
      if (data?.company_id) {
        setCompanyId(data.company_id);
      }
    } catch (error) {
      console.error('Error in fetchUserCompanyId:', error);
    }
  }, []);

  const checkPositionCreationAccess = useCallback(async () => {
    if (!companyId || positionAccessChecked.current) return;
    
    positionAccessChecked.current = true;
    
    try {
      const { data, error } = await supabase.rpc('can_open_new_position', { p_company_id: companyId })
      
      if (error) {
        setCanCreatePosition(false);
        return;
      }
      
      let hasAccess = false;
      if (typeof data === 'boolean') {
        hasAccess = data;
      } else if (typeof data === 'string') {
        hasAccess = data === 'true' || data === 'True' || data === 'TRUE';
      } else if (typeof data === 'number') {
        hasAccess = data === 1;
      }
      
      setCanCreatePosition(hasAccess);
    } catch (error) {
      console.error('Error checking position access:', error);
      setCanCreatePosition(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserCompanyId(session.user.id);
    }
  }, [session?.user?.id, fetchUserCompanyId]);

  useEffect(() => {
    if (companyId) {
      checkPositionCreationAccess();
    }
  }, [companyId, checkPositionCreationAccess]);

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

  const userId = session.user.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setAnalysisResult(null)

    if (!selectedManager) {
      setMessage({ 
        text: 'Please select a manager for this position', 
        type: 'error' 
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/new-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          id: positionId,
          position_name: positionName,
          manager_id: selectedManager.user_id,
          position_description: positionDescription,
          position_description_detailed: positionDescriptionDetailed,
          position_start_date: positionStartDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: `${data.error || t('newPosition.messages.errorCreating')}`, type: 'error' })
      } else {
        setMessage({ text: t('newPosition.messages.successCreated'), type: 'success' })
        setPositionId(data.id)
        setPositionName('')
        setSelectedManager(null)
        setPositionDescription('')
        setPositionDescriptionDetailed('')
        setPositionStartDate('')
      }
    } catch (error) {
      setMessage({ text: `${t('newPosition.messages.unexpectedError')} ${(error as Error).message}`, type: 'error' })
    }

    setLoading(false)
  }

  const handleAnalyseClick = async () => {
    setFetchingCount(true);
    
    try {
      const res = await fetch(`/api/candidate-count?user_id=${userId}`);
      const data = await res.json();
      
      if (!res.ok) {
        setMessage({ 
          text: t('newPosition.messages.errorFetchingCount'), 
          type: 'error' 
        });
        setFetchingCount(false);
        return;
      }
      
      const count = data.count || 0;
      setCandidateCount(count);
      
      if (count === 0) {
        setMessage({ 
          text: t('newPosition.messages.noCandidates'), 
          type: 'error' 
        });
        setFetchingCount(false);
        return;
      }
      
      setFetchingCount(false);
      setShowConfirmModal(true);
    } catch (error) {
      console.error('Error fetching candidate count:', error);
      setMessage({ 
        text: t('newPosition.messages.unexpectedErrorRetry'), 
        type: 'error' 
      });
      setFetchingCount(false);
    }
  }

  const handleAnalyseMassive = async () => {
    if (!positionId) return

    setShowConfirmModal(false);
    setAnalysisLoading(true)
    setAnalysisResult(null)
    setMessage(null)
    setProgress(0)

    try {
      const es = new EventSource(`/api/analyse-massive?position_id=${positionId}&user_id=${userId}&company_id=${companyId}`)

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
          setMessage({ text: `${data.error}`, type: 'error' })
          setAnalysisLoading(false)
          es.close()
        }
      }

      es.onerror = (err) => {
        console.error('SSE error:', err)
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
    setShowConfirmModal(false);
    setMessage({ 
      text: t('newPosition.messages.createdRunLater'), 
      type: 'success' 
    });
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
            <Plus className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              {t('newPosition.header.title')}
            </h1>
            <p className="text-gray-600">{t('newPosition.header.subtitle')}</p>
          </div>
        </div>

        {canCreatePosition === false && (
          <div className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                {t('newPosition.limitReached.title')}
              </h3>
              <p className="text-red-700 mb-6">
                {t('newPosition.limitReached.message')}
              </p>
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
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div>
                    <label htmlFor="positionName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Briefcase className="w-4 h-4" />
                      {t('newPosition.form.positionName')}
                    </label>
                    <input
                      id="positionName"
                      type="text"
                      value={positionName}
                      onChange={(e) => setPositionName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={t('newPosition.form.positionNamePlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="manager" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <User className="w-4 h-4" />
                      Manager <span className="text-red-500">*</span>
                    </label>
                    {companyId ? (
                      <ManagerDropdown 
                        selectedManager={selectedManager}
                        onSelect={setSelectedManager}
                        companyId={companyId}
                        t={t}
                      />
                    ) : (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-400">
                        Loading managers...
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="positionDescription" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <FileText className="w-4 h-4" />
                      {t('newPosition.form.positionDescription')}
                    </label>
                    <textarea
                      id="positionDescription"
                      value={positionDescription}
                      onChange={(e) => setPositionDescription(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={4}
                      placeholder={t('newPosition.form.positionDescriptionPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="positionDescriptionDetailed" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Activity className="w-4 h-4" />
                      {t('newPosition.form.positionDescriptionDetailed')}
                    </label>
                    <textarea
                      id="positionDescriptionDetailed"
                      value={positionDescriptionDetailed}
                      onChange={(e) => setPositionDescriptionDetailed(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={4}
                      placeholder={t('newPosition.form.positionDescriptionDetailedPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="positionStartDate" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Calendar className="w-4 h-4" />
                      {t('newPosition.form.startingDate')}
                    </label>
                    <input
                      id="positionStartDate"
                      type="date"
                      value={positionStartDate}
                      onChange={(e) => setPositionStartDate(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

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

            {message && (
              <div className={`rounded-2xl p-4 sm:p-6 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={`font-medium ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            )}

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
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            )}

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