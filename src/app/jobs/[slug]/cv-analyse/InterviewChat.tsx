'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  User,
  Bot,
  ChevronRight,
  Mic,
  PenLine,
} from 'lucide-react'
import { useLocale } from 'i18n/LocaleProvider'

interface Message {
  role: 'interviewer' | 'candidate'
  content: string
}

interface InterviewChatProps {
  cvText: string
  jobDescription: string
  positionName: string
  candidateId: number
  positionId: string
  language?: string
  candidateFirstName?: string
}

const TOTAL_QUESTIONS = 10

export default function InterviewChat({
  cvText,
  jobDescription,
  positionName,
  candidateId,
  positionId,
  language,
  candidateFirstName,
}: InterviewChatProps) {
  const { t } = useLocale()

  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [interviewDone, setInterviewDone] = useState(false)
  const [isConcluding, setIsConcluding] = useState(false)
  const [closingMessage, setClosingMessage] = useState('')
  const [error, setError] = useState('')

  // Suggested answers state
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customInput, setCustomInput] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const customInputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoadingQuestion, currentSuggestions, showCustomInput, scrollToBottom])

  useEffect(() => {
    if (showCustomInput) {
      setTimeout(() => customInputRef.current?.focus(), 100)
    }
  }, [showCustomInput])

  // ─── Send an answer (suggestion or custom) ──────────────────────────────────
  const sendAnswer = useCallback(async (answer: string) => {
    if (!answer.trim() || isSending || isLoadingQuestion || interviewDone) return

    setIsSending(true)
    setCurrentSuggestions([])
    setShowCustomInput(false)
    setCustomInput('')

    const candidateMessage: Message = { role: 'candidate', content: answer.trim() }
    const updatedHistory = [...messages, candidateMessage]
    setMessages(updatedHistory)

    const nextQuestion = questionCount + 1

    if (nextQuestion > TOTAL_QUESTIONS) {
      await concludeInterview(updatedHistory)
    } else {
      await fetchNextQuestion(updatedHistory, nextQuestion)
    }

    setIsSending(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSending, isLoadingQuestion, interviewDone, messages, questionCount])

  // ─── Fetch next question + suggestions ──────────────────────────────────────
  const fetchNextQuestion = useCallback(
    async (history: Message[], nextNumber: number) => {
      setIsLoadingQuestion(true)
      setError('')
      setCurrentSuggestions([])
      setShowCustomInput(false)

      try {
        const res = await fetch('/api/interview-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cvText,
            jobDescription,
            positionName,
            conversationHistory: history,
            questionNumber: nextNumber,
            language,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to get question')

        const newMessage: Message = { role: 'interviewer', content: data.question }
        setMessages(prev => [...prev, newMessage])
        setQuestionCount(nextNumber)

        // Set the 3 suggested answers
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setCurrentSuggestions(data.suggestions)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load question')
      } finally {
        setIsLoadingQuestion(false)
      }
    },
    [cvText, jobDescription, positionName, language]
  )

  // ─── Conclude interview ──────────────────────────────────────────────────────
  const concludeInterview = useCallback(
    async (finalHistory: Message[]) => {
      setIsConcluding(true)
      setError('')

      const closing = t('interview.closing') ||
        "Thank you for this virtual interview! Our HR recruiter will carefully review your responses and contact you about potential next steps. We truly appreciate the time you've taken. 🙏"

      setClosingMessage(closing)

      try {
        const res = await fetch('/api/interview-conclude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cvText,
            jobDescription,
            positionName,
            conversationHistory: finalHistory,
            candidateId,
            positionId,
            language,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to conclude')
      } catch (err) {
        console.error('Conclude error:', err)
      } finally {
        setIsConcluding(false)
        setInterviewDone(true)
      }
    },
    [cvText, jobDescription, positionName, candidateId, positionId, language, t]
  )

  const handleStart = useCallback(async () => {
    setStarted(true)
    await fetchNextQuestion([], 1)
  }, [fetchNextQuestion])

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendAnswer(customInput)
    }
  }

  const progressPercent = Math.min((questionCount / TOTAL_QUESTIONS) * 100, 100)

  // Count only interviewer messages for accurate question label
  const getQuestionIndex = (msgIndex: number) => {
    let count = 0
    for (let i = 0; i <= msgIndex; i++) {
      if (messages[i]?.role === 'interviewer') count++
    }
    return count
  }

  // ─── NOT STARTED ────────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="rounded-2xl overflow-hidden shadow-sm border border-indigo-100">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400" />
        <div className="bg-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {t('interview.cta.title') || 'Virtual Interview Available'}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {t('interview.cta.subtitle') || `${TOTAL_QUESTIONS} personalized questions • ~10 minutes`}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-xl p-4 mb-6 border border-indigo-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('interview.cta.description') ||
                "Your profile looks great! You're invited to complete a short virtual interview tailored to your background and this position. This is optional but gives you an extra chance to stand out."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6 text-center">
            {[
              { icon: '🎯', label: t('interview.cta.feature1') || 'Personalised questions' },
              { icon: '🤖', label: t('interview.cta.feature2') || 'AI-powered' },
              { icon: '⚡', label: t('interview.cta.feature3') || 'Instant results' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                <div className="text-xl mb-1">{f.icon}</div>
                <p className="text-xs text-gray-600 font-medium">{f.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold text-sm sm:text-base transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              <MessageSquare className="w-4 h-4" />
              {t('interview.cta.startButton') || 'Start Virtual Interview'}
              <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-gray-400 text-center sm:text-left self-center">
              {t('interview.cta.optional') || 'Optional — you can skip this step'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── CHAT INTERFACE ──────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-indigo-100 bg-white">

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm sm:text-base">
                {t('interview.chat.title') || 'Virtual Interview'}
              </p>
              <p className="text-white/70 text-xs">{positionName}</p>
            </div>
          </div>

          {!interviewDone ? (
            <div className="text-right">
              <p className="text-white/80 text-xs mb-1">{questionCount}/{TOTAL_QUESTIONS}</p>
              <div className="w-24 sm:w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-medium">
                {t('interview.chat.completed') || 'Completed'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="h-96 sm:h-[480px] overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50">

        {/* Welcome */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="max-w-[85%]">
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                {(t('interview.chat.welcome') ?? `Hello! Welcome to your virtual interview for the ${positionName} position. I'll ask you ${TOTAL_QUESTIONS} questions tailored to your profile. For each question, you can choose a suggested answer or write your own.`)
                  .replace('{name}', candidateFirstName ? ` ${candidateFirstName}` : '')}
              </p>
            </div>
          </div>
        </div>

        {/* Conversation messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${msg.role === 'candidate' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                msg.role === 'interviewer'
                  ? 'bg-gradient-to-br from-violet-500 to-blue-600'
                  : 'bg-gradient-to-br from-gray-600 to-gray-800'
              }`}
            >
              {msg.role === 'interviewer'
                ? <Bot className="w-3.5 h-3.5 text-white" />
                : <User className="w-3.5 h-3.5 text-white" />
              }
            </div>

            <div className={`max-w-[85%] flex flex-col ${msg.role === 'candidate' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'interviewer' && (
                <span className="text-xs text-violet-600 font-medium mb-1 ml-1">
                  {t('interview.chat.questionLabel') || 'Question'} {getQuestionIndex(i)}/{TOTAL_QUESTIONS}
                </span>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'interviewer'
                    ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                    : 'bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-tr-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {isLoadingQuestion && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Concluding */}
        {isConcluding && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                <span className="text-sm text-gray-500">
                  {t('interview.chat.evaluating') || 'Evaluating your answers...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Closing message */}
        {closingMessage && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="max-w-[85%]">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <p className="text-sm text-emerald-800 leading-relaxed">{closingMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-xs text-red-600">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Answer area ────────────────────────────────────────────────────────── */}
      {!interviewDone && !isLoadingQuestion && !isConcluding && currentSuggestions.length > 0 && (
        <div className="border-t border-gray-100 bg-white p-3 sm:p-4 space-y-3">

          {/* Suggested answers */}
          {!showCustomInput && (
            <>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {t('interview.chat.suggestionsLabel') || 'Choose an answer or write your own'}
              </p>

              <div className="space-y-2">
                {currentSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => sendAnswer(suggestion)}
                    disabled={isSending}
                    className="w-full text-left px-4 py-3 rounded-xl border border-violet-100 bg-violet-50 hover:bg-violet-100 hover:border-violet-300 text-sm text-gray-700 leading-relaxed transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="text-violet-400 font-bold mr-2 group-hover:text-violet-600 transition-colors">
                      {i === 0 ? '▸' : i === 1 ? '▸' : '▸'}
                    </span>
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Write own answer button */}
              <button
                onClick={() => setShowCustomInput(true)}
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 text-sm text-gray-500 hover:text-gray-700 transition-all duration-150 disabled:opacity-50"
              >
                <PenLine className="w-3.5 h-3.5" />
                {t('interview.chat.writeOwnAnswer') || 'Write my own answer'}
              </button>
            </>
          )}

          {/* Custom input */}
          {showCustomInput && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {t('interview.chat.yourAnswer') || 'Your answer'}
                </p>
                <button
                  onClick={() => setShowCustomInput(false)}
                  className="text-xs text-violet-500 hover:text-violet-700 transition-colors"
                >
                  ← {t('interview.chat.backToSuggestions') || 'Back to suggestions'}
                </button>
              </div>

              <div className="flex gap-2 items-end">
                <textarea
                  ref={customInputRef}
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={handleCustomKeyDown}
                  placeholder={t('interview.chat.inputPlaceholder') || 'Type your answer... (Enter to send, Shift+Enter for new line)'}
                  disabled={isSending}
                  rows={3}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  onClick={() => sendAnswer(customInput)}
                  disabled={!customInput.trim() || isSending}
                  className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 flex items-center justify-center transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transform enabled:hover:scale-105"
                >
                  {isSending
                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                    : <Send className="w-4 h-4 text-white" />
                  }
                </button>
              </div>
              <p className="text-xs text-gray-400 ml-1">
                {t('interview.chat.hint') || 'Press Enter to send • Shift+Enter for new line'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sending spinner between questions */}
      {!interviewDone && isSending && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
          <span className="text-sm text-gray-400">
            {t('interview.chat.sending') || 'Sending...'}
          </span>
        </div>
      )}
    </div>
  )
}