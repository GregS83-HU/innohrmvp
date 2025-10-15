'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Calendar, FileText, Briefcase, BarChart3, CheckCircle, AlertCircle, Activity, Lock, X, Clock, Users } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Confirmation Modal Component
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
  if (!isOpen) return null

  const estimatedMinutes = Math.ceil((candidateCount * 5) / 60)
  const estimatedTime = estimatedMinutes < 1 
    ? `${candidateCount * 5} seconds`
    : `${estimatedMinutes} minute${estimatedMinutes > 1 ? 's' : ''}`

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
            Confirm Analysis
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-center">
            You are about to analyze all candidates in your database against this position.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-100">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{candidateCount}</div>
              <div className="text-xs text-gray-600">Candidates</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center border border-purple-100">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{candidateCount}</div>
              <div className="text-xs text-gray-600">AI Credits</div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 justify-center text-amber-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Estimated time: ~{estimatedTime}
              </span>
            </div>
          </div>

          {/* Warning Text */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              This will consume <span className="font-semibold text-gray-800">{candidateCount} AI credits</span> from your account.
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
                Processing...
              </>
            ) : (
              'Confirm & Start Analysis'
            )}
          </button>
          
          <button
            onClick={onCreateWithoutAnalysis}
            disabled={loading}
            className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Position Without Analysis
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full text-gray-500 py-2 px-6 rounded-lg font-medium hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function NewOpenedPositionPage() {
  const router = useRouter()
  const session = useSession()

  const [positionName, setPositionName] = useState('')
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

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [candidateCount, setCandidateCount] = useState(0)
  const [fetchingCount, setFetchingCount] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  // Fetch user's company_id
  const fetchUserCompanyId = useCallback(async (userId: string) => {
    console.log('👤 Starting to fetch company_id for userId:', userId);
    
    try {
      const { data, error } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', userId)
        .single();
      
      console.log('📊 Fetch company_id response:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching company_id:', error);
        return;
      }
      
      if (data?.company_id) {
        console.log('✅ Company ID found:', data.company_id);
        setCompanyId(data.company_id);
      } else {
        console.log('⚠️ No company_id found in user data:', data);
      }
    } catch (error) {
      console.error('💥 Catch block error in fetchUserCompanyId:', error);
    }
  }, []);

  // Check if user can create new position
  const checkPositionCreationAccess = useCallback(async () => {
    console.log('🎯 checkPositionCreationAccess called with:', {
      companyId,
      alreadyChecked: positionAccessChecked.current
    });
    
    if (!companyId) {
      console.log('❌ No companyId available, cannot check access');
      return;
    }
    
    if (positionAccessChecked.current) {
      console.log('❌ Access already checked, skipping');
      return;
    }
    
    console.log('🔍 Checking position creation access for company_id:', companyId);
    positionAccessChecked.current = true;
    
    try {
      console.log('📞 Calling supabase.rpc with params:', { p_company_id: companyId });
      
      const { data, error } = await supabase.rpc('can_open_new_position', { p_company_id: companyId })
      
      console.log('📨 RPC Response:', { data, error, dataType: typeof data });
      
      if (error) {
        console.log('❌ RPC Error:', error);
        setCanCreatePosition(false);
        return;
      }
      
      if (data === null || data === undefined) {
        console.log('❌ Data is null/undefined, setting access to false');
        setCanCreatePosition(false);
        return;
      }
      
      let hasAccess = false;
      
      if (typeof data === 'boolean') {
        console.log('🔧 Data is boolean:', data);
        hasAccess = data;
      } else if (typeof data === 'string') {
        console.log('🔧 Data is string:', data);
        hasAccess = data === 'true' || data === 'True' || data === 'TRUE';
      } else if (typeof data === 'number') {
        console.log('🔧 Data is number:', data);
        hasAccess = data === 1;
      } else if (typeof data === 'object' && data !== null) {
        console.log('🔧 Data is object:', data);
        hasAccess = data.result === true || data.result === 'true' || 
                   data.can_access === true || data.can_access === 'true' ||
                   data[0] === true || data[0] === 'true' ||
                   data === true;
      }
      
      console.log('✅ Final access decision:', hasAccess);
      setCanCreatePosition(hasAccess);
      
    } catch (error) {
      console.error('💥 Catch block error:', error);
      setCanCreatePosition(false);
    }
  }, [companyId]);

  // Initialize user data and check access
  useEffect(() => {
    console.log('🚀 useEffect for session triggered:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (session?.user?.id) {
      console.log('✅ Valid session found, fetching company ID...');
      fetchUserCompanyId(session.user.id);
    } else {
      console.log('❌ No valid session or user ID');
    }
  }, [session?.user?.id, fetchUserCompanyId]);

  // Check access when companyId is available
  useEffect(() => {
    console.log('🎯 useEffect for companyId triggered:', {
      companyId,
      canCreatePosition,
      accessChecked: positionAccessChecked.current
    });
    
    if (companyId) {
      console.log('✅ Company ID available, checking access...');
      checkPositionCreationAccess();
    } else {
      console.log('❌ No company ID yet');
    }
  }, [companyId, checkPositionCreationAccess]);

  if (!session || canCreatePosition === null) {
    console.log('🔄 Loading state:', {
      hasSession: !!session,
      canCreatePosition,
      companyId,
      accessChecked: positionAccessChecked.current
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!session ? 'Loading user info...' : 'Checking position limits...'}
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Debug: Session: {!!session ? 'Yes' : 'No'} | CompanyID: {companyId || 'None'} | Access: {String(canCreatePosition)}
          </div>
        </div>
      </div>
    )
  }

  const userId = session.user.id

  // Création de la position
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setAnalysisResult(null)

    setLoading(true)

    try {
      const res = await fetch('/api/new-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          id: positionId,
          position_name: positionName,
          position_description: positionDescription,
          position_description_detailed: positionDescriptionDetailed,
          position_start_date: positionStartDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: `${data.error || 'Error creating position'}`, type: 'error' })
      } else {
        setMessage({ text: 'New position successfully created', type: 'success' })
        setPositionId(data.id)
        setPositionName('')
        setPositionDescription('')
        setPositionDescriptionDetailed('')
        setPositionStartDate('')
      }
    } catch (error) {
      setMessage({ text: `Unexpected error: ${(error as Error).message}`, type: 'error' })
    }

    setLoading(false)
  }

  // Open modal and fetch candidate count
  const handleAnalyseClick = async () => {
   // await fetchCandidateCount();
    
    // Check if we fetched the count and if there are candidates
    // We need to wait a bit for state to update, or we can use a different approach
    // Let's refactor to handle this properly
    setFetchingCount(true);
    
    try {
      const res = await fetch(`/api/candidate-count?user_id=${userId}`);
      const data = await res.json();
      
      if (!res.ok) {
        setMessage({ 
          text: 'Could not fetch candidate count. Please try again.', 
          type: 'error' 
        });
        setFetchingCount(false);
        return;
      }
      
      const count = data.count || 0;
      setCandidateCount(count);
      
      if (count === 0) {
        setMessage({ 
          text: 'No candidates found in your database. Please add candidates first.', 
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
        text: 'Unexpected error. Please try again.', 
        type: 'error' 
      });
      setFetchingCount(false);
    }
  }

  // Lancement de l'analyse massive avec progression
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
            text: `Analyse completed: ${data.matched} / ${data.total} candidates are corresponding`,
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
        setMessage({ text: 'Unexpected server error during analysis', type: 'error' })
        setAnalysisLoading(false)
        es.close()
      }
    } catch (error) {
      setMessage({ text: `Unexpected error: ${(error as Error).message}`, type: 'error' })
      setAnalysisLoading(false)
    }
  }

  // Handle "Create Without Analysis" option
  const handleCreateWithoutAnalysis = () => {
    setShowConfirmModal(false);
    setMessage({ 
      text: 'Position created successfully. You can run the analysis later.', 
      type: 'success' 
    });
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
            <Plus className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Create a New Position
            </h1>
            <p className="text-gray-600">Fill out the form below to create a new job position</p>
          </div>
        </div>

        {/* Position Limit Reached Message */}
        {canCreatePosition === false && (
          <div className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                Position Limit Reached
              </h3>
              <p className="text-red-700 mb-6">
                Sorry, you have reached the limit of your forfait. To create more positions, please upgrade your plan.
              </p>
              <button 
                className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 px-8 rounded-lg font-medium hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                onClick={() => {
                  console.log('Redirect to upgrade page')
                }}
              >
                Upgrade Your Plan
              </button>
            </div>
          </div>
        )}

        {/* Main Form - Only show if user can create position */}
        {canCreatePosition === true && (
          <>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Position Name */}
                  <div>
                    <label htmlFor="positionName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Briefcase className="w-4 h-4" />
                      Position Name
                    </label>
                    <input
                      id="positionName"
                      type="text"
                      value={positionName}
                      onChange={(e) => setPositionName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g. Senior Software Developer"
                    />
                  </div>

                  {/* Position Description */}
                  <div>
                    <label htmlFor="positionDescription" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <FileText className="w-4 h-4" />
                      Position Description (for display)
                    </label>
                    <textarea
                      id="positionDescription"
                      value={positionDescription}
                      onChange={(e) => setPositionDescription(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={4}
                      placeholder="Brief description that will be shown to candidates..."
                    />
                  </div>

                  {/* Position Description Detailed */}
                  <div>
                    <label htmlFor="positionDescriptionDetailed" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Activity className="w-4 h-4" />
                      Position Description Detailed (For AI analyse)
                    </label>
                    <textarea
                      id="positionDescriptionDetailed"
                      value={positionDescriptionDetailed}
                      onChange={(e) => setPositionDescriptionDetailed(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={4}
                      placeholder="Detailed requirements, skills, and qualifications for AI matching..."
                    />
                  </div>

                  {/* Starting Date */}
                  <div>
                    <label htmlFor="positionStartDate" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Calendar className="w-4 h-4" />
                      Starting Date
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create Position
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Messages */}
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

            {/* Analysis Section */}
            {positionId && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                    <Activity className="w-5 h-5" />
                    Candidate Analysis
                  </h3>
                  
                  <button
                    onClick={handleAnalyseClick}
                    disabled={analysisLoading || fetchingCount}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
                  >
                    {fetchingCount ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Loading...
                      </>
                    ) : analysisLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Analyse running...
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5" />
                        Launch analyse on the database
                      </>
                    )}
                  </button>

                  {/* Progress Bar */}
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

            {/* Analysis Results & Action */}
            {analysisResult && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                    <BarChart3 className="w-5 h-5" />
                    Analysis Results
                  </h3>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {analysisResult.matched} / {analysisResult.total}
                      </div>
                      <p className="text-gray-600">Matching candidates found</p>
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
                    View Details
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
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