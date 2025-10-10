'use client'

import { useState } from 'react'

type InterviewQuestion = {
  category: string
  text: string
}

type InterviewSummary = {
  summary: string
  strengths?: string[]
  weaknesses?: string[]
  cultural_fit: string
  recommendation: string
  score: number
}

export default function InterviewAssistantModal({
  candidatId,
  positionId,
  onClose
}: {
  candidatId: number
  positionId: number | null
  onClose: () => void
}) {
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[] | null>(null)
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
        }),
      })
      const data: { questions: InterviewQuestion[] } = await res.json()
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
          notes: interviewNotes,
          status: 'Done',
        }),
      })
      const data: InterviewSummary = await res.json()
      setInterviewSummary(data)
    } catch (err) {
      console.error('Failed to generate summary', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Interview Assistant</h2>

        {/* Step 1: Questions */}
        {!interviewQuestions && step === 'questions' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Generate smart, role-specific interview questions based on the candidate’s CV and the job description.
            </p>
            <button
              onClick={handleGenerateQuestions}
              disabled={isLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all"
            >
              {isLoading ? 'Generating…' : 'Generate Questions'}
            </button>
          </div>
        )}

        {/* Show questions */}
        {interviewQuestions && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-800">Suggested Questions</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              {interviewQuestions.map((q: InterviewQuestion, i: number) => (
                <li key={i}>
                  <span className="font-semibold capitalize">{q.category}:</span> {q.text}
                </li>
              ))}
            </ul>

            <textarea
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Write your interview notes here..."
              className="w-full border rounded-lg p-3 text-sm mt-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
            />

            <button
              onClick={handleGenerateSummary}
              disabled={isLoading || !interviewNotes}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
            >
              {isLoading ? 'Analyzing…' : 'Generate Summary'}
            </button>
          </div>
        )}

        {/* Show summary */}
        {interviewSummary && (
          <div className="mt-6 space-y-2 text-gray-800 text-sm">
            <h3 className="text-lg font-semibold text-green-800">Interview Summary</h3>
            <p><strong>Summary:</strong> {interviewSummary.summary}</p>
            <p><strong>Strengths:</strong> {interviewSummary.strengths?.join(', ')}</p>
            <p><strong>Weaknesses:</strong> {interviewSummary.weaknesses?.join(', ')}</p>
            <p><strong>Cultural Fit:</strong> {interviewSummary.cultural_fit}</p>
            <p><strong>Recommendation:</strong> {interviewSummary.recommendation}</p>
            <p><strong>Score:</strong> {interviewSummary.score}/10</p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
