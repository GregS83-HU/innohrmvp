'use client'

import { useState } from 'react'

// Define the result type to match what the API returns
interface ImportResult {
  email?: string
  success?: boolean
  error?: string
}

export default function AdminImportUsersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<ImportResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResults(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/import-users', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setResults(data.results)
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6">Import Users</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Upload CSV or XLSX</label>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Start Import'}
          </button>
        </form>

        {results && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="bg-gray-100 rounded-xl p-4 max-h-80 overflow-auto">
              {results.map((r, i) => (
                <div key={i} className="p-2 border-b border-gray-300">
                  {r.success ? (
                    <span className="text-green-600 font-medium">✔ {r.email} imported</span>
                  ) : (
                    <span className="text-red-600 font-medium">✖ {r.email} — {r.error}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}