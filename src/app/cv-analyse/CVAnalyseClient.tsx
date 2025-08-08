'use client'

import { useState } from 'react'

export default function CVAnalyseClient({
  positionName,
  jobDescription,
  positionId,
}: {
  positionName: string
  jobDescription: string
  positionId : String

}) {
  const [file, setFile] = useState<File | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobDescription', jobDescription)
    formData.append('firstName', firstName)
    formData.append('lastName', lastName)
    formData.append('positionId', positionId.toString())

    setLoading(true)
    setError('')
    setAnalysis('')
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
      setScore(data.score)
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

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h1 className="text-2xl font-bold text-center mb-6">
        📄 Analyse de CV AI pour le poste : <span className="text-blue-600">{positionName}</span>
      </h1>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block font-medium">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white shadow-sm">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="cv-upload"
          />
          <label
            htmlFor="cv-upload"
            className="block cursor-pointer text-blue-600 hover:underline"
          >
            {file ? (
              <span>✅ {file.name}</span>
            ) : (
              <span>📎 Cliquez ici pour sélectionner un fichier PDF</span>
            )}
          </label>
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold text-white ${
            loading || !file
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Analyse en cours...' : 'Analyser le CV'}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-600 font-semibold">
          ❌ {error}
        </div>
      )}

      {score !== null && analysis && (
  <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-sm">
    <h2 className="text-lg font-semibold mb-2">🧠 Résultat de l’analyse :</h2>
    <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>

    <h2 className="text-lg font-semibold mt-4 mb-2">📊 Votre score :</h2>
    <p className="text-sm font-semibold">{score}/10</p>

    {score < 5 ? (
      <p className="mt-4 text-red-600 font-bold">
        Thank you for your application. Unfortunately, your resume does not sufficiently match the position in question. We invite you to explore our other openings on our website.
      </p>
    ) : (
      <p className="mt-4 text-green-600 font-bold">
        Thank you for your application   ! Your resume is a good match for the position. A member of our HR team will contact you shortly.
      </p>
    )}
  </div>
    )}
    </div>

  )
  
}