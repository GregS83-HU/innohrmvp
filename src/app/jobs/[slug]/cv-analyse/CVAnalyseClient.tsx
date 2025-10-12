'use client'

import { useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, AlertCircle, User, Brain, BarChart3, Shield, MessageSquare, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CVAnalyseClient({
  positionName,
  jobDescription,
  jobDescriptionDetailed,
  positionId,
  gdpr_file_url,
  companyName,
}: {
  positionName: string
  jobDescription: string
  jobDescriptionDetailed: string
  positionId: string
  gdpr_file_url: string
  companyName: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isDemo = pathname.includes('/demo/')
  
  // Extract company slug from pathname for back navigation
  const companySlug = pathname.split('/')[2] // /jobs/[slug]/cv-analyse
  
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState('')
  const [candidateFeedback, setCandidateFeedback] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gdprAccepted, setGdprAccepted] = useState(false)
  const [analysisCompleted, setAnalysisCompleted] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Handle back navigation - simulate browser back button
  const handleBackToPositions = useCallback(() => {
    router.back()
  }, [router])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !gdprAccepted || analysisCompleted) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobDescription', jobDescription)
    formData.append('jobDescriptionDetailed', jobDescriptionDetailed)
    formData.append('positionId', positionId)
    formData.append('companySlug', companySlug)

    setLoading(true)
    setError('')
    setAnalysis('')
    setCandidateFeedback('')
    setScore(null)
    setShowSuccessMessage(false)

    try {
      const res = await fetch('/api/analyse-cv', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Server error.')
      }

      setAnalysis(data.analysis)
      setCandidateFeedback(data.candidateFeedback)
      setScore(data.score)
      setAnalysisCompleted(true)
      
      // Show success message with animation delay
      setTimeout(() => {
        setShowSuccessMessage(true)
      }, 100)
    } catch (err: unknown) {
      // Log technical error to console for debugging
      console.error('CV Analysis Error:', err)
      
      // Clear file selection to force re-upload
      setFile(null)
      setGdprAccepted(false)
      
      // Show user-friendly error message
      setError('Unfortunately, we are not able to read your CV. Can you try to upload a new one?')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 5) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreMessage = (score: number) => {
    if (score < 5) {
      return {
        text: "Thank you for your application. Unfortunately, your resume does not sufficiently match the position. Explore our other openings.",
        color: "text-red-600"
      }
    } else if (score >= 5 && score < 8) {
      return {
        text: "Your CV partially matches the position. Our HR specialist will analyse it.",
        color: "text-orange-600"
      }
    } else {
      return {
        text: "Thank you for your application! Your resume is a good match. A member of HR will contact you shortly.",
        color: "text-green-600"
      }
    }
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="space-y-4 sm:space-y-6">
        
        {/* Back Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToPositions}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to positions</span>
          </button>
        </div>
        
        {/* Header */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
            <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
              AI CV Analysis
            </h1>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg inline-block mb-2">
              <span className="font-semibold text-sm sm:text-base">{positionName}</span>
            </div>
            {companyName && (
              <p className="text-gray-600 text-sm sm:text-base">at {companyName}</p>
            )}
          </div>
        </div>

        {/* Position Description */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Position Description</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{jobDescriptionDetailed}</p>
        </div>

        {/* Demo CVs Download Block */}
        {isDemo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Download our fake CVs</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <a
                href="https://drive.google.com/uc?export=download&id=1-pMKT5dp-8PjJI2RbaVbUNuxt_rxXLFG"
                download
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Fake Software Engineer</span>
              </a>
              
              <a
                href="https://drive.google.com/uc?export=download&id=15kzhUQFvizgx1Zhx9MG-CJAhTvHc3gJS"
                download
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Fake Marketing Expert</span>
              </a>
            </div>
            
            <p className="text-sm text-gray-700 text-center">
              We strongly advice you to use our fake CV in the demo. If you would like to use a real one, please note that all the demo data including CVs are deleted each night at 2AM.
            </p>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6">
            
            {/* Important Notice */}
            {!analysisCompleted && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-yellow-800 font-medium text-sm sm:text-base">
                    Please ensure that you have your phone number and email address in your CV
                  </p>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${
                analysisCompleted 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                  id="cv-upload"
                  disabled={analysisCompleted}
                />
                <label
                  htmlFor="cv-upload"
                  className={analysisCompleted ? 'cursor-not-allowed' : 'cursor-pointer'}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
                      <span className="text-green-600 font-semibold text-sm sm:text-base break-all px-2">{file.name}</span>
                      {!analysisCompleted && (
                        <span className="text-xs sm:text-sm text-gray-500">Click to change file</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                      <span className={`font-semibold text-sm sm:text-base ${analysisCompleted ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}>
                        Click here to select your CV
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">(PDF only)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* GDPR Checkbox */}
            {file && !analysisCompleted && gdpr_file_url && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="gdpr"
                    type="checkbox"
                    checked={gdprAccepted}
                    onChange={(e) => setGdprAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                    disabled={analysisCompleted}
                  />
                  <label htmlFor="gdpr" className="text-xs sm:text-sm text-gray-700 flex-1">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Please read and accept our{' '}
                    <a
                      href={gdpr_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-700"
                    >
                      GDPR policy
                    </a>
                  </label>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || (gdpr_file_url && !gdprAccepted) || loading || analysisCompleted}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-white text-base sm:text-lg transition-all shadow-md hover:shadow-lg transform ${
                loading || !file || (gdpr_file_url && !gdprAccepted) || analysisCompleted
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
              }`}
            >
              {analysisCompleted ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Analysis Completed
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Analysis running...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                  Analyze your CV
                </div>
              )}
            </button>

            {/* Success Message - Now positioned below the button */}
            {showSuccessMessage && analysisCompleted && (
              <div className={`transition-all duration-500 ease-out transform ${
                showSuccessMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-800 font-medium text-sm sm:text-base">
                      Analysis completed successfully! Your CV has been processed and saved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-700 text-sm sm:text-base">Upload Error</h3>
                <p className="text-red-600 text-sm sm:text-base">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {score !== null && candidateFeedback && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            
            {/* Score Card */}
            <div className={`rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 border-2 ${getScoreColor(score)}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl font-semibold">Your Score</h2>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-center sm:text-right">
                  {score}/10
                </div>
              </div>
              
              <div className={`p-3 sm:p-4 rounded-lg border ${getScoreMessage(score).color.replace('text-', 'border-').replace('-600', '-200')} bg-white`}>
                <p className={`font-semibold text-sm sm:text-base ${getScoreMessage(score).color}`}>
                  {getScoreMessage(score).text}
                </p>
              </div>
            </div>

            {/* Candidate Feedback */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Personalized Feedback</h2>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {candidateFeedback}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  )
}