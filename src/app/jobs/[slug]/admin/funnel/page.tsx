'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, Users, FileSearch, Tag, MousePointerClick, Calculator, Mail, Building2 } from 'lucide-react'

interface FunnelData {
  range: { from: string; to: string }
  funnel: {
    jobAssistantStarted: number
    jobAssistantCompleted: number
    pricingViewed: number
    pricingCtaClicked: number
    pricingCtaClickedByPlan: Record<string, number>
    roiCalculatorUsed: number
    contactFormSubmitted: number
    contactFormSubmittedBySource: Record<string, number>
    companiesOnboarded: number
    companiesOnboardedTracedToContact: number
  }
}

function toDateInputValue(iso: string) {
  return iso.slice(0, 10)
}

export default function FunnelDashboardPage() {
  const [from, setFrom] = useState(() => toDateInputValue(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()))
  const [to, setTo] = useState(() => toDateInputValue(new Date().toISOString()))
  const [data, setData] = useState<FunnelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchFunnel = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        from: new Date(from).toISOString(),
        to: new Date(to + 'T23:59:59').toISOString(),
      })
      const res = await fetch(`/api/admin/funnel?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load funnel data')
      setData(json)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    fetchFunnel()
  }, [fetchFunnel])

  const steps = data
    ? [
        { label: 'Job Assistant started', value: data.funnel.jobAssistantStarted, icon: FileSearch, color: 'bg-emerald-500' },
        { label: 'Job Assistant completed', value: data.funnel.jobAssistantCompleted, icon: TrendingUp, color: 'bg-emerald-600' },
        { label: 'Pricing page viewed', value: data.funnel.pricingViewed, icon: Tag, color: 'bg-brand-500' },
        { label: 'Pricing CTA clicked', value: data.funnel.pricingCtaClicked, icon: MousePointerClick, color: 'bg-brand-600' },
        { label: 'ROI calculator used', value: data.funnel.roiCalculatorUsed, icon: Calculator, color: 'bg-indigo-500' },
        { label: 'Contact form submitted', value: data.funnel.contactFormSubmitted, icon: Mail, color: 'bg-purple-600' },
        { label: 'Companies onboarded', value: data.funnel.companiesOnboarded, icon: Building2, color: 'bg-gray-800' },
      ]
    : []

  const maxValue = Math.max(1, ...steps.map((s) => s.value))

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-6 h-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-800">Funnel Dashboard</h1>
        </div>
        <p className="text-gray-500 mb-6 text-sm">
          Job Assistant usage → pricing → contact form → onboarded companies. See <code>FUNNEL_TRACKING.md</code> for what each step means and how it&apos;s tracked.
        </p>

        {/* Date range */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button
            onClick={fetchFunnel}
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>
        )}

        {data && (
          <>
            {/* Funnel bars */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
              {steps.map(({ label, value, icon: Icon, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2 text-gray-700">
                      <Icon className="w-4 h-4 text-gray-400" /> {label}
                    </span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${Math.max(2, (value / maxValue) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdowns */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Pricing CTA clicks by plan</h3>
                <ul className="space-y-2 text-sm">
                  {Object.entries(data.funnel.pricingCtaClickedByPlan).map(([plan, count]) => (
                    <li key={plan} className="flex justify-between">
                      <span className="capitalize text-gray-600">{plan}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact submissions by source</h3>
                <ul className="space-y-2 text-sm">
                  {Object.entries(data.funnel.contactFormSubmittedBySource).length === 0 && (
                    <li className="text-gray-400">No submissions in this range</li>
                  )}
                  {Object.entries(data.funnel.contactFormSubmittedBySource).map(([source, count]) => (
                    <li key={source} className="flex justify-between">
                      <span className="capitalize text-gray-600">{source}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-sm text-amber-800">
              Of the {data.funnel.companiesOnboarded} compan{data.funnel.companiesOnboarded === 1 ? 'y' : 'ies'} onboarded in this range,{' '}
              <strong>{data.funnel.companiesOnboardedTracedToContact}</strong> {data.funnel.companiesOnboardedTracedToContact === 1 ? 'has' : 'have'} been manually
              linked back to the contact-form submission that led to it (<code>company.onboarded_from_contact_submission_id</code>). This is set by hand today — see
              FUNNEL_TRACKING.md for how.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
