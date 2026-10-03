'use client'

import { useState, useEffect, useCallback } from 'react'
import { CreditCard, Gift, CheckCircle2, Circle } from 'lucide-react'

interface Company {
  id: number
  company_name: string | null
  slug: string | null
  forfait: string | null
  stripe_subscription_id: string | null
  billing_interval: 'month' | 'year' | null
  onboarding_fee_paid_at: string | null
  founding_discount_coupon_id: string | null
  founding_discount_applied_at: string | null
  grace_until: string | null
  employee_count: number
}

const FOUNDING_COUPONS = ['founding_customer_30', 'founding_customer_40'] as const

function BooleanBadge({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-green-700">
      <CheckCircle2 className="w-3.5 h-3.5" /> {trueLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-gray-400">
      <Circle className="w-3.5 h-3.5" /> {falseLabel}
    </span>
  )
}

export default function BillingAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<number | null>(null)
  const [error, setError] = useState('')

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/billing')
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

  const handleApplyDiscount = async (company: Company, couponId: (typeof FOUNDING_COUPONS)[number]) => {
    setApplying(company.id)
    setError('')
    try {
      const res = await fetch('/api/admin/billing/founding-discount', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: company.id, coupon_id: couponId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to apply discount')
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === company.id
            ? { ...c, founding_discount_coupon_id: json.company.founding_discount_coupon_id, founding_discount_applied_at: json.company.founding_discount_applied_at }
            : c
        )
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to apply discount')
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-6 h-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-800">Billing</h1>
        </div>
        <p className="text-gray-500 mb-6 text-sm">
          Plan, employee count, billing interval, onboarding fee, and founding-customer discount status for every company.
          The founding discount can be applied once per company (30% or 40% off the base fee for 12 months) and only to a
          company with an active Stripe subscription.
        </p>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse h-64" />
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Interval</th>
                  <th className="px-4 py-3 font-medium">Employees</th>
                  <th className="px-4 py-3 font-medium">Onboarding fee</th>
                  <th className="px-4 py-3 font-medium">Founding discount</th>
                  <th className="px-4 py-3 font-medium">Grace until</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.company_name || `#${c.id}`}</div>
                      <div className="text-xs text-gray-400">{c.slug}</div>
                    </td>
                    <td className="px-4 py-3">{c.forfait || 'Free'}</td>
                    <td className="px-4 py-3">{c.billing_interval || '—'}</td>
                    <td className="px-4 py-3">{c.employee_count}</td>
                    <td className="px-4 py-3">
                      <BooleanBadge value={!!c.onboarding_fee_paid_at} trueLabel="Paid" falseLabel="Not paid" />
                    </td>
                    <td className="px-4 py-3">
                      {c.founding_discount_applied_at ? (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <Gift className="w-3.5 h-3.5" /> {c.founding_discount_coupon_id}
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.grace_until ? <span className="text-amber-600">{new Date(c.grace_until).toLocaleDateString()}</span> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {!c.stripe_subscription_id ? (
                        <span className="text-gray-400 text-xs">No subscription</span>
                      ) : c.founding_discount_applied_at ? (
                        <span className="text-gray-400 text-xs">Already applied</span>
                      ) : (
                        <div className="flex gap-2">
                          {FOUNDING_COUPONS.map((couponId) => (
                            <button
                              key={couponId}
                              onClick={() => handleApplyDiscount(c, couponId)}
                              disabled={applying === c.id}
                              className="px-2 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-medium disabled:opacity-50"
                            >
                              {couponId.endsWith('30') ? '30% / 12mo' : '40% / 12mo'}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
