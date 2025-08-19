'use client'

import { useState } from 'react'

export default function UploadCertificatePage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    employee_name?: string
    absenceDateStart?: string
    absenceDateEnd?: string
    doctor_name?: string
  } | null>(null)
  const [saving, setSaving] = useState(false)

  const handleUpload = async () => {
    if (!file) return setError('Please select a file')
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/medical-certificates/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Upload failed')
      }


      const data = await res.json()
      const extracted = data.extracted_data || {}
      // Return from API
      setResult({
        employee_name: extracted.employee_name,
        absenceDateStart: extracted.sickness_start_date,
        absenceDateEnd: extracted.sickness_end_date,
        doctor_name: extracted.doctor_name,
      })
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!result) return
    setSaving(true)
    try {
      const res = await fetch('/api/medical-certificates/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
      if (!res.ok) throw new Error(await res.text())
      alert('Certificate saved successfully!')
      window.location.reload()
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Unknown error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    window.location.reload()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h1 className="text-2xl font-bold text-center mb-6">
        📄 Upload Medical Certificate
      </h1>

      {!result && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleUpload()
          }}
          className="space-y-4"
        >
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white shadow-sm">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
              id="certificate-upload"
            />
            <label
              htmlFor="certificate-upload"
              className="block cursor-pointer text-blue-600 hover:underline"
            >
              {file ? <span>✅ {file.name}</span> : <span>📎 Click here to select your file (PDF or Image)</span>}
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold text-white ${
              loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      )}

      {error && <div className="mt-4 text-red-600 font-semibold">❌ {error}</div>}

      {result && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-sm space-y-4">
          <h2 className="text-lg font-semibold mb-2">📋 Certificate Details:</h2>
          <p><strong>Employee Name:</strong> {result.employee_name}</p>
          <p><strong>Start Absence date:</strong> {result.absenceDateStart}</p>
           <p><strong>End Absence date:</strong> {result.absenceDateEnd}</p>
          <p><strong>Doctor Name:</strong> {result.doctor_name}</p>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleConfirm}
              disabled={saving}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold text-white ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {saving ? 'Saving...' : 'Confirm'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
