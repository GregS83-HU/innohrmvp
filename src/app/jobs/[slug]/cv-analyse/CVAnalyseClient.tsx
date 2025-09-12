'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Upload, FileText, CheckCircle, AlertCircle, User, Brain, BarChart3, Shield, MessageSquare, Download } from 'lucide-react'

export default function CVAnalyseClient({
  positionName,
  jobDescription,
  jobDescriptionDetailed,
  positionId,
  gdpr_file_url,
}: {
  positionName: string
  jobDescription: string
  jobDescriptionDetailed: string
  positionId: string
  gdpr_file_url: string
}) {
  const pathname = usePathname()
  const isDemo = pathname.includes('/demo/')
  console.log("URL?",pathname)
  console.log("demo?", isDemo)

  const [file, setFile] = useState<File | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [candidateFeedback, setCandidateFeedback] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gdprAccepted, setGdprAccepted] = useState(false)
  const [analysisCompleted, setAnalysisCompleted] = useState(false)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !gdprAccepted || analysisCompleted) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobDescription', jobDescription)
    formData.append('jobDescriptionDetailed', jobDescriptionDetailed)
    formData.append('firstName', firstName)
    formData.append('lastName', lastName)
    formData.append('positionId', positionId)

    setLoading(true)
    setError('')
    setAnalysis('')
    setCandidateFeedback('')
    setScore(null)

    try {
      const res = await fetch('/api/analyse-cv', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur serveur.')
      }

      setAnalysis(data.analysis)
      setCandidateFeedback(data.candidateFeedback)
      setScore(data.score)
      setAnalysisCompleted(true) // Marquer l'analyse comme terminée
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur inconnue.')
      }
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
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
            <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              AI CV Analysis
            </h1>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg inline-block">
              <span className="font-semibold">{positionName}</span>
            </div>
          </div>
        </div>

        {/* Position Description */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Position Description</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">{jobDescription}</p>
        </div>

        {/* Demo CVs Download Block */}
        {isDemo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Download our fake CVs</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <a
                href="/fake_cv_software_engineer.pdf"
                download
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm sm:text-base">Fake Software Engineer</span>
              </a>
              
              <a
                href="/fake_cv_marketing_expert.pdf"
                download
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm sm:text-base">Fake Marketing Expert</span>
              </a>
            </div>
            
            <p className="text-sm text-gray-700 text-center">
              If you want to analyze your own CV, please note that all the data will be deleted each night at 1 AM.
            </p>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <User className="w-4 h-4" />
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={analysisCompleted}
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <User className="w-4 h-4" />
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={analysisCompleted}
                />
              </div>
            </div>

            {/* Important Notice */}
            {!analysisCompleted && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800 font-medium">
                    Please ensure that you have your phone number and email address in your CV
                  </p>
                </div>
              </div>
            )}

            {/* Analysis Completed Notice */}
            {analysisCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">
                    Analysis completed successfully! Your CV has been processed and saved.
                  </p>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">CV Upload</label>
              <div className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
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
                      <CheckCircle className="w-12 h-12 text-green-500" />
                      <span className="text-green-600 font-semibold text-sm sm:text-base break-all">{file.name}</span>
                      {!analysisCompleted && (
                        <span className="text-sm text-gray-500">Click to change file</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-12 h-12 text-gray-400" />
                      <span className={`font-semibold text-sm sm:text-base ${analysisCompleted ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}>
                        Click here to select your CV
                      </span>
                      <span className="text-sm text-gray-500">(PDF only)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* GDPR Checkbox */}
            {file && !analysisCompleted && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="gdpr"
                    type="checkbox"
                    checked={gdprAccepted}
                    onChange={(e) => setGdprAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={analysisCompleted}
                  />
                  <label htmlFor="gdpr" className="text-sm text-gray-700 flex-1">
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
              disabled={!file || !gdprAccepted || loading || analysisCompleted}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all shadow-md hover:shadow-lg transform ${
                loading || !file || !gdprAccepted || analysisCompleted
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
              }`}
            >
              {analysisCompleted ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Analysis Completed
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Analysis running...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Brain className="w-5 h-5" />
                  Analyze your CV
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-700">Analysis Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {score !== null && candidateFeedback && (
          <div className="space-y-6">
            
            {/* Score Card */}
            <div className={`rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 border-2 ${getScoreColor(score)}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Your Score</h2>
                </div>
                <div className="text-3xl font-bold text-center sm:text-right">
                  {score}/10
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${getScoreMessage(score).color.replace('text-', 'border-').replace('-600', '-200')} bg-white`}>
                <p className={`font-semibold ${getScoreMessage(score).color}`}>
                  {getScoreMessage(score).text}
                </p>
              </div>
            </div>

            {/* Candidate Feedback (Shown to candidate) */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Personalized Feedback</h2>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {candidateFeedback}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}