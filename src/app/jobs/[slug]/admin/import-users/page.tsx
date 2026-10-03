'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Define the result type to match what the API returns
interface ImportResult {
  email?: string
  success?: boolean
  error?: string
}

// Mirrors the row shape/parsing rules in src/app/api/import-users/route.ts
// so this preview matches what the server will actually do.
interface CSVRow {
  email?: string
  company_id?: number | string
  is_admin?: boolean | string
}

export default function AdminImportUsersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<ImportResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [accessChecked, setAccessChecked] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  // Confirmation gate for bulk admin-grants: listing exactly who would
  // become an admin and requiring an explicit click, separate from the
  // regular "create these users" action.
  const [pendingAdminEmails, setPendingAdminEmails] = useState<string[] | null>(null)
  const [adminGrantConfirmed, setAdminGrantConfirmed] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setAccessChecked(true)
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('is_super_admin')
        .eq('id', session.user.id)
        .single()

      setIsSuperAdmin(userData?.is_super_admin === true)
      setAccessChecked(true)
    }

    checkAccess()
  }, [])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    setResults(null)
    setPendingAdminEmails(null)
    setAdminGrantConfirmed(false)
    setPreviewError(null)

    if (!selected) return

    try {
      const buffer = await selected.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const rows = XLSX.utils.sheet_to_json<CSVRow>(workbook.Sheets[sheetName])

      const adminEmails = rows
        .filter((row) => row.is_admin === true || row.is_admin === 'true')
        .map((row) => row.email?.toLowerCase())
        .filter((email): email is string => !!email)

      setPendingAdminEmails(adminEmails)
    } catch {
      // Preview is best-effort UX only - the server independently validates
      // and parses the file for real, so a preview failure isn't blocking.
      setPreviewError('Could not preview this file\'s contents before import. Admin grants (if any) will still happen on import as usual.')
    }
  }

  const needsAdminConfirmation = (pendingAdminEmails?.length ?? 0) > 0 && !adminGrantConfirmed

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || needsAdminConfirmation) return

    setLoading(true)
    setResults(null)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setResults([{ error: 'Your session has expired. Please sign in again.' }])
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/import-users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      setResults([{ error: errorBody.error || 'Import failed' }])
      setLoading(false)
      return
    }

    const data = await res.json()
    setResults(data.results)
    setLoading(false)
  }

  if (!accessChecked) {
    return (
      <div className="min-h-screen p-10 bg-gray-50">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8 text-gray-500">
          Loading…
        </div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen p-10 bg-gray-50">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-2">Access denied</h1>
          <p className="text-gray-600">This page is restricted to super admins.</p>
        </div>
      </div>
    )
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
              onChange={handleFileChange}
              className="block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          {previewError && (
            <p className="text-sm text-amber-700">{previewError}</p>
          )}

          {pendingAdminEmails && pendingAdminEmails.length > 0 && !adminGrantConfirmed && (
            <div className="border border-amber-300 bg-amber-50 rounded-xl p-4">
              <p className="font-medium text-amber-900 mb-2">
                This file will grant admin access to {pendingAdminEmails.length} user{pendingAdminEmails.length > 1 ? 's' : ''}:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-900 mb-4 max-h-32 overflow-auto">
                {pendingAdminEmails.map((email) => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setAdminGrantConfirmed(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
              >
                I understand, grant admin access to these users
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file || needsAdminConfirmation}
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
