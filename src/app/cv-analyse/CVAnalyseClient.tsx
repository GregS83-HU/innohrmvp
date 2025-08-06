// src/app/cv-analyse/CVAnalyseClient.tsx
'use client'

import { useState } from 'react'

interface CVAnalyseClientProps {
  jobDescription: string
  positionName: string
}

export default function CVAnalyseClient({ jobDescription, positionName }: CVAnalyseClientProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ analysis: string; score: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobDescription', jobDescription)

    try {
      const res = await fetch('/api/analyse-cv', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Erreur API: ${text || res.statusText}`)
      }

      const data = await res.json()
      setResult({ analysis: data.analysis, score: data.score })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">📄 Analyse de CV avec AI pour la position : {positionName || '-'}</h1>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white shadow-sm">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
          id="cv-upload"
        />
        <label htmlFor="cv-upload" className="block cursor-pointer text-blue-600 hover:underline">
          {file ? <span>✅ {file.name}</span> : <span>📎 Cliquez ici pour sélectionner un fichier PDF</span>}
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold text-white ${
          loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Analyse en cours...' : 'Analyser le CV'}
      </button>

      {error && <div className="mt-4 text-red-600 font-medium text-center">{error}</div>}

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">🧠 Résultat de l’analyse :</h2>
          <pre className="whitespace-pre-wrap text-sm">{result.analysis}</pre>
          <h2 className="text-lg font-semibold mb-2">Votre score:</h2>
          <pre className="whitespace-pre-wrap text-sm">{result.score}</pre>

          {result.score < 5 ? (
            <p className="mt-4 text-red-600 font-bold">
              Thanks for your application. Unfortunately, we can’t proceed with your application as your CV doesn’t match the job description but we invite you to consult our website for other available positions.
            </p>
          ) : (
            <p className="mt-4 text-green-600 font-bold">
              Thanks for your application! Your CV is matching! One of our HR specialists will contact you shortly!
            </p>
          )}
        </div>
      )}
    </main>
  )
}