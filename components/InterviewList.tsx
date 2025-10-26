'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import { useLocale } from 'i18n/LocaleProvider'
import { Calendar, MapPin, PlusCircle, Trash, Eye, MessageSquare } from 'lucide-react'

// Define types
interface InterviewSummary {
  summary: string
  strengths: string[]
  weaknesses: string[]
  cultural_fit: string
  recommendation: string
  score: number
}

interface Interview {
  id: number
  candidat_id: number
  position_id: number | null
  recruiter_id: string
  interview_datetime: string
  location?: string
  status: 'pending' | 'done' | 'cancelled'
  notes?: string
  summary?: InterviewSummary
  recruitment_step_id?: number | null
  recruitment_steps?: {
    step_name: string
  }
}

interface Question {
  category: string
  text: string
}

export default function InterviewList({
  candidatId,
  positionId,
  stepId,
}: {
  candidatId: number
  positionId: number | null
  stepId: string | null
}) {
  const { t, locale } = useLocale()  // ⭐ Added: Get locale from context
  const session = useSession()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [location, setLocation] = useState('')
  const [showAssistantModal, setShowAssistantModal] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)

  const loadInterviews = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/interviews?candidat_id=${candidatId}`)
    const data = await res.json()

    // Sort interviews chronologically
    data.sort(
      (a: Interview, b: Interview) =>
        new Date(a.interview_datetime).getTime() -
        new Date(b.interview_datetime).getTime()
    )

    setInterviews(data)
    setLoading(false)
  }, [candidatId])

  useEffect(() => {
    loadInterviews()
  }, [loadInterviews])

  const createInterview = async () => {
    if (!session?.user?.id) {
      alert(t('interviewList.loginRequired'))
      return
    }

    const recruiterId = session.user.id
    const datetime = new Date(`${newDate}T${newTime}`).toISOString()

    const body = {
      candidat_id: candidatId,
      position_id: positionId,
      recruiter_id: recruiterId,
      interview_datetime: datetime,
      location,
      locale,  // ⭐ Added: Pass current locale to API
    }

    const res = await fetch('/api/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const result = await res.json()
    if (res.ok) {
      await loadInterviews()
      setNewDate('')
      setNewTime('')
      setLocation('')
    } else {
      console.error('❌ Interview creation error:', result)
      alert(result.error || t('interviewList.createError'))
    }
  }

  const deleteInterview = async (id: number) => {
    await fetch(`/api/interviews`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id, 
        status: 'cancelled',
        locale  // ⭐ Added: Pass current locale to API
      }),
    })
    setShowCancelModal(false)
    setSelectedInterview(null)
    loadInterviews()
  }

  const handleCancelClick = (interview: Interview) => {
    setSelectedInterview(interview)
    setShowCancelModal(true)
  }

  const handleInterviewAction = (interview: Interview) => {
    setSelectedInterview(interview)
    if (interview.status === 'done') {
      setShowSummaryModal(true)
    } else if (interview.status === 'pending') {
      setShowAssistantModal(true)
    }
  }

  const handleCloseModals = () => {
    setShowAssistantModal(false)
    setShowSummaryModal(false)
    setSelectedInterview(null)
    loadInterviews() // Reload to get updated data
  }

  // Helper function for status-based styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-gray-100 border-gray-300'
      case 'pending':
        return 'bg-green-100 border-green-300'
      case 'cancelled':
        return 'bg-red-100 border-red-300'
      default:
        return 'bg-white border-gray-200'
    }
  }

  return (
    <div className="space-y-3">
      {loading && <p className="text-gray-500 text-sm">{t('interviewList.loading')}</p>}
      {!loading && interviews.length === 0 && (
        <p className="text-gray-500 text-sm italic">{t('interviewList.noInterviews')}</p>
      )}

      {interviews.map((intv) => (
        <div
          key={intv.id}
          className={`p-3 rounded-lg flex justify-between items-center border ${getStatusStyles(
            intv.status
          )}`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar
                className={`w-4 h-4 ${
                  intv.status === 'done'
                    ? 'text-gray-400'
                    : intv.status === 'pending'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              />
              {new Date(intv.interview_datetime).toLocaleString()}
              
              {/* Step Badge */}
              <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                {intv.recruitment_steps?.step_name || t('interviewList.stepUnassigned')}
              </span>
            </div>
            {intv.location && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3" />
                {intv.location}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {intv.status === 'done' && (
              <button
                onClick={() => handleInterviewAction(intv)}
                className="text-indigo-600 hover:text-indigo-800 p-1"
                title={t('interviewList.tooltips.viewSummary')}
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
            {intv.status === 'pending' && (
              <button
                onClick={() => handleInterviewAction(intv)}
                className="text-green-600 hover:text-green-800 p-1"
                title={t('interviewList.tooltips.startAssistant')}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            )}
            {intv.status !== 'cancelled' && (
              <button
                onClick={() => handleCancelClick(intv)}
                className="text-red-600 hover:text-red-800 p-1"
                title={t('interviewList.tooltips.cancelInterview')}
              >
                <Trash className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add new interview */}
{stepId && stepId !== undefined && (
  <div className="bg-white border border-green-200 p-3 rounded-lg space-y-2">
    <div className="flex gap-2">
      <input
        type="date"
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
        className="border rounded px-2 py-1 text-sm flex-1"
      />
      <input
        type="time"
        value={newTime}
        onChange={(e) => setNewTime(e.target.value)}
        className="border rounded px-2 py-1 text-sm flex-1"
      />
    </div>
    <input
      type="text"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      placeholder={t('interviewList.locationPlaceholder')}
      className="border rounded px-2 py-1 text-sm w-full"
    />
    <button
      onClick={createInterview}
      disabled={!newDate || !newTime}
      className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <PlusCircle className="w-4 h-4" /> {t('interviewList.addInterview')}
    </button>
  </div>
)}


      {/* Modals */}
      {showAssistantModal && selectedInterview && (
        <InterviewAssistantModal
          candidatId={candidatId}
          positionId={positionId}
          interviewId={selectedInterview.id}
          onClose={handleCloseModals}
        />
      )}

      {showSummaryModal && selectedInterview && (
        <InterviewSummaryModal
          interview={selectedInterview}
          onClose={handleCloseModals}
        />
      )}

      {showCancelModal && selectedInterview && (
        <CancelInterviewModal
          interview={selectedInterview}
          onConfirm={() => deleteInterview(selectedInterview.id)}
          onCancel={() => {
            setShowCancelModal(false)
            setSelectedInterview(null)
          }}
        />
      )}
    </div>
  )
}

// Cancel Interview Confirmation Modal
function CancelInterviewModal({ 
  interview, 
  onConfirm, 
  onCancel 
}: { 
  interview: Interview
  onConfirm: () => void
  onCancel: () => void
}) {
  const { t } = useLocale()
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <Trash className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{t('interviewList.cancelModal.title')}</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          {t('interviewList.cancelModal.description')}
        </p>
        
        <div className="bg-gray-50 p-3 rounded-lg mb-6">
          <p className="text-sm text-gray-700">
            <strong>{t('interviewList.cancelModal.dateLabel')}:</strong> {new Date(interview.interview_datetime).toLocaleString()}
          </p>
          {interview.location && (
            <p className="text-sm text-gray-700 mt-1">
              <strong>{t('interviewList.cancelModal.locationLabel')}:</strong> {interview.location}
            </p>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all font-medium"
          >
            {t('interviewList.cancelModal.goBackButton')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all font-medium"
          >
            {t('interviewList.cancelModal.confirmButton')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Summary Display Modal
function InterviewSummaryModal({ 
  interview, 
  onClose 
}: { 
  interview: Interview
  onClose: () => void 
}) {
  const { t } = useLocale()
  const summary = interview.summary

  if (!summary) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('interviewList.summaryModal.title')}</h2>
          <p className="text-gray-600">{t('interviewList.summaryModal.noSummary')}</p>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
            >
              {t('interviewList.summaryModal.closeButton')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('interviewList.summaryModal.title')}</h2>
        
        <div className="space-y-4 text-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Calendar className="w-4 h-4" />
            {new Date(interview.interview_datetime).toLocaleString()}
            {interview.recruitment_steps?.step_name && (
              <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                {interview.recruitment_steps.step_name}
              </span>
            )}
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">{t('interviewList.summaryModal.summaryLabel')}</h3>
            <p className="text-sm">{summary.summary}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">{t('interviewList.summaryModal.strengthsLabel')}</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {summary.strengths?.map((strength: string, i: number) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">{t('interviewList.summaryModal.weaknessesLabel')}</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {summary.weaknesses?.map((weakness: string, i: number) => (
                <li key={i}>{weakness}</li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{t('interviewList.summaryModal.culturalFitLabel')}</h3>
            <p className="text-sm">{summary.cultural_fit}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">{t('interviewList.summaryModal.recommendationLabel')}</h3>
            <p className="text-sm">{summary.recommendation}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">{t('interviewList.summaryModal.scoreLabel')}</h3>
            <p className="text-2xl font-bold">{summary.score}/10</p>
          </div>

          {interview.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{t('interviewList.summaryModal.notesLabel')}</h3>
              <p className="text-sm whitespace-pre-wrap">{interview.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            {t('interviewList.summaryModal.closeButton')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Interview Assistant Modal
function InterviewAssistantModal({
  candidatId,
  positionId,
  interviewId,
  onClose
}: {
  candidatId: number
  positionId: number | null
  interviewId: number
  onClose: () => void
}) {
  const { t, locale } = useLocale()
  const [interviewQuestions, setInterviewQuestions] = useState<Question[] | null>(null)
  const [interviewNotes, setInterviewNotes] = useState('')
  const [interviewSummary, setInterviewSummary] = useState<InterviewSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'questions' | 'summary'>('questions')

  async function handleGenerateQuestions() {
    setIsLoading(true)
    setStep('questions')
    try {
      const res = await fetch('/api/interview-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'questions',
          candidat_id: candidatId,
          position_id: positionId,
          interview_id: interviewId,
          locale,
        }),
      })
      const data = await res.json()
      setInterviewQuestions(data.questions)
    } catch (err) {
      console.error('Failed to generate questions', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGenerateSummary() {
    setIsLoading(true)
    setStep('summary')
    try {
      const res = await fetch('/api/interview-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'summary',
          candidat_id: candidatId,
          position_id: positionId,
          interview_id: interviewId,
          notes: interviewNotes,
          locale,
        }),
      })
      const data = await res.json()
      setInterviewSummary(data)
    } catch (err) {
      console.error('Failed to generate summary', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleClose() {
    // Update interview status to "done" only if summary was generated
    if (interviewSummary) {
      try {
        await fetch('/api/interviews', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: interviewId, 
            status: 'done'
          }),
        })
      } catch (err) {
        console.error('Failed to update interview status', err)
      }
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('interviewList.assistantModal.title')}</h2>

        {/* Step 1: Questions */}
        {!interviewQuestions && step === 'questions' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              {t('interviewList.assistantModal.step1Description')}
            </p>
            <button
              onClick={handleGenerateQuestions}
              disabled={isLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isLoading ? t('interviewList.assistantModal.generating') : t('interviewList.assistantModal.generateQuestionsButton')}
            </button>
          </div>
        )}

        {/* Show questions */}
        {interviewQuestions && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-800">{t('interviewList.assistantModal.suggestedQuestionsTitle')}</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              {interviewQuestions.map((q: Question, i: number) => (
                <li key={i}>
                  <span className="font-semibold capitalize">{q.category}:</span> {q.text}
                </li>
              ))}
            </ul>

            <textarea
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder={t('interviewList.assistantModal.notesPlaceholder')}
              className="w-full border rounded-lg p-3 text-sm mt-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={6}
            ></textarea>

            <button
              onClick={handleGenerateSummary}
              disabled={isLoading || !interviewNotes}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
            >
              {isLoading ? t('interviewList.assistantModal.analyzing') : t('interviewList.assistantModal.generateSummaryButton')}
            </button>
          </div>
        )}

        {/* Show summary */}
        {interviewSummary && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold text-green-800">{t('interviewList.assistantModal.summaryTitle')}</h3>
            
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm"><strong>{t('interviewList.assistantModal.summaryLabel')}:</strong> {interviewSummary.summary}</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm"><strong>{t('interviewList.assistantModal.strengthsLabel')}:</strong> {interviewSummary.strengths?.join(', ')}</p>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm"><strong>{t('interviewList.assistantModal.weaknessesLabel')}:</strong> {interviewSummary.weaknesses?.join(', ')}</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm"><strong>{t('interviewList.assistantModal.culturalFitLabel')}:</strong> {interviewSummary.cultural_fit}</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm"><strong>{t('interviewList.assistantModal.recommendationLabel')}:</strong> {interviewSummary.recommendation}</p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm"><strong>{t('interviewList.assistantModal.scoreLabel')}:</strong> <span className="text-lg font-bold">{interviewSummary.score}/10</span></p>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={handleClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            {interviewSummary ? t('interviewList.assistantModal.closeInterviewButton') : t('interviewList.assistantModal.closeButton')}
          </button>
        </div>
      </div>
    </div>
  )
}