'use client'

import { useState, useEffect, useCallback } from 'react'
import { ClipboardCheck, CheckCircle2, Circle, Mail, Phone } from 'lucide-react'

interface Company {
  id: number
  company_name: string | null
  slug: string | null
  forfait: string | null
  onboarding_completed: boolean
  onboarding_completed_at: string | null
  assisted_onboarding_requested: boolean
  assisted_call_completed_at: string | null
  created_at: string
  onboarding_link_sent_at: string | null
  onboarding_reminder_sent_at: string | null
}

function EmailStatusBadge({ sentAt }: { sentAt: string | null }) {
  if (!sentAt) {
    return <span className="text-slate-400">Not sent</span>
  }
  return (
    <span className="inline-flex items-center gap-1 text-slate-600" title={new Date(sentAt).toLocaleString()}>
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

  const patchCompany = async (company: Company, body: Record<string, unknown>) => {
    setSaving(company.id)
    setError('')
    try {
      const res = await fetch('/api/admin/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: company.id, ...body }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update')
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, ...json.company } : c)))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSaving(null)
    }
  }

  const handleToggle = (company: Company) =>
    patchCompany(company, { onboarding_completed: !company.onboarding_completed })

  const handleCallToggle = (company: Company) =>
    patchCompany(company, { assisted_call_completed: !company.assisted_call_completed_at })

  const callBackCount = companies.filter((c) => c.assisted_onboarding_requested && !c.assisted_call_completed_at).length

  return (
    <div className="min-h-screen p-6 md:p-10 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck className="w-6 h-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-slate-800">Onboarding</h1>
        </div>
        <p className="text-slate-500 mb-4 text-sm">
          Companies onboard themselves: time &amp; attendance, absences, performance management, the AI
          wellbeing chatbot and medical certificates unlock automatically when the setup wizard is finished
          and the first subscription payment succeeds. The toggle below is a manual override.
          Companies that paid for the optional assisted onboarding call are flagged so you can call them back.
        </p>
        {callBackCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-6 text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0" />
            {callBackCount === 1 ? '1 company is waiting' : `${callBackCount} companies are waiting`} for an assisted onboarding call.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-slate-400">Loading…</div>
          ) : companies.length === 0 ? (
            <div className="p-6 text-sm text-slate-400">No companies found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Assisted call</th>
                  <th className="px-4 py-3 font-medium">Booking Email</th>
                  <th className="px-4 py-3 font-medium">Reminder</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 text-slate-900">{c.company_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{c.slug || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{c.forfait || 'Free'}</td>
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
                      {!c.assisted_onboarding_requested ? (
                        <span className="text-slate-400">No</span>
                      ) : (
                        <button
                          onClick={() => handleCallToggle(c)}
                          disabled={saving === c.id}
                          title={c.assisted_call_completed_at ? 'Click to mark the call as not done' : 'Click once the call has happened'}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium disabled:opacity-50 ${
                            c.assisted_call_completed_at
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {c.assisted_call_completed_at ? 'Call done' : 'Call back – mark done'}
                        </button>
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
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
