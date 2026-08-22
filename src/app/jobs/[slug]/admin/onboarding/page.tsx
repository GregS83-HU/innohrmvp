'use client'

import { useState, useEffect, useCallback } from 'react'
import { ClipboardCheck, CheckCircle2, Circle, Mail } from 'lucide-react'

interface Company {
  id: number
  company_name: string | null
  slug: string | null
  onboarding_completed: boolean
  created_at: string
  onboarding_link_sent_at: string | null
  onboarding_reminder_sent_at: string | null
}

function EmailStatusBadge({ sentAt }: { sentAt: string | null }) {
  if (!sentAt) {
    return <span className="text-gray-400">Not sent</span>
  }
  return (
    <span className="inline-flex items-center gap-1 text-gray-600" title={new Date(sentAt).toLocaleString()}>
      <Mail className="w-3.5 h-3.5" /> Sent
    </span>
  )
}

export default function OnboardingAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [error, setError] = useState('')

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/onboarding')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load companies')
      setCompanies(json.companies)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleToggle = async (company: Company) => {
    setSaving(company.id)
    setError('')
    try {
      const res = await fetch('/api/admin/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: company.id, onboarding_completed: !company.onboarding_completed }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update')
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, onboarding_completed: json.company.onboarding_completed } : c)))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck className="w-6 h-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-800">Onboarding</h1>
        </div>
        <p className="text-gray-500 mb-6 text-sm">
          Time &amp; attendance, absences, performance management, and the AI wellbeing chatbot stay
          locked for a company until its onboarding call is done and you flip it on here - regardless of plan.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-gray-400">Loading…</div>
          ) : companies.length === 0 ? (
            <div className="p-6 text-sm text-gray-400">No companies found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Booking Email</th>
                  <th className="px-4 py-3 font-medium">Reminder</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 text-gray-900">{c.company_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.slug || '—'}</td>
                    <td className="px-4 py-3">
                      {c.onboarding_completed ? (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircle2 className="w-4 h-4" /> Onboarded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <Circle className="w-4 h-4" /> Not onboarded
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EmailStatusBadge sentAt={c.onboarding_link_sent_at} />
                    </td>
                    <td className="px-4 py-3">
                      <EmailStatusBadge sentAt={c.onboarding_reminder_sent_at} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggle(c)}
                        disabled={saving === c.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          c.onboarding_completed
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-brand-600 hover:bg-brand-700 text-white'
                        }`}
                      >
                        {saving === c.id ? 'Saving…' : c.onboarding_completed ? 'Mark not onboarded' : 'Mark onboarded'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
