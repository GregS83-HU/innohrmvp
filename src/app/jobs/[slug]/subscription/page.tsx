'use client'

import { useEffect, useState, useCallback } from "react"
import { createClient } from '@supabase/supabase-js'
import { useSession } from '@supabase/auth-helpers-react'
import { useSearchParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Check, Zap, Phone, CreditCard, Loader2 } from 'lucide-react'
import { loadStripe } from "@stripe/stripe-js"
import { useLocale } from '../../../../i18n/LocaleProvider'
import { safeErrorInfo } from '../../../../../lib/logSafe';
import { ASSISTED_ONBOARDING_FEE_HUF } from '../../../../config/onboarding';
import { buttonClass, cardClass, eyebrowClass, iconTileClass, pageClass } from '../../../../../components/ui/styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Plan = {
  id: string
  name: string
  isFree: boolean
  baseFeeHuf: number | null
  perSeatFeeHuf: number | null
  minEmployees: number | null
  maxEmployees: number | null
  description: string
  features: string[]
  popular?: boolean
  includedAICredits?: number
}

type Subscription = {
  plan: string
  status: string
  billingInterval: 'month' | 'year' | null
  hasStripeSubscription: boolean
  onboardingFeePaid: boolean
  employeeCount: number
}

type Toast = { 
  id: string
  message: string
  type: 'success' | 'error' 
}

interface ForfaitData {
  id: number
  forfait_name?: string
  description?: string
  max_opened_position?: number
  max_medical_certificates?: number
  access_happy_check?: boolean
  access_performance?: boolean
  access_advanced_reporting?: boolean
  base_fee_huf?: number | null
  per_seat_fee_huf?: number | null
  min_employees?: number | null
  max_employees?: number | null
  included_ai_credits?: number
}

interface AICreditPack {
  id: string
  credits: number
  stripe_price_id: string
  price: number
  currency: string
}

export default function ManageSubscription() {
  const session = useSession()
  const searchParams = useSearchParams()
  const { t } = useLocale()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  const [currentAICredits, setCurrentAICredits] = useState<number | null>(null)
  const [aiCreditPacks, setAICreditPacks] = useState<AICreditPack[]>([])
  const [includedAICredits, setIncludedAICredits] = useState<number>(0)
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  const [isManagingBilling, setIsManagingBilling] = useState(false)
  // Optional paid assisted onboarding call - only adds the one-time fee to
  // checkout when ticked (see create-subscription/route.ts).
  const [assistedOnboarding, setAssistedOnboarding] = useState(false)


  const addToast = (message: string, type: 'success' | 'error' = 'error') => {
    const id = uuidv4()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  // --- Fetch AI credit packs dynamically
  const fetchAICreditPacks = useCallback(async () => {
    try {
      console.log("Fetching AI credit packs...")
      const { data: creditPacks, error } = await supabase
        .from('ai_credit_packs')
        .select('*')
        .order('credits')
        console.log("AI credit packs fetched, count:", creditPacks?.length ?? 0, "hadError:", !!error)


      if (error || !creditPacks) {
        addToast(t('subscription.errors.fetchCreditPacks'), "error")
        return
      }

      const mappedPacks = creditPacks.map(pack => ({
      ...pack,
      stripe_price_id: pack.price_id
    }))

      setAICreditPacks(mappedPacks)
    } catch (err) {
      console.error(safeErrorInfo(err))
      addToast(t('subscription.errors.unexpectedCreditPacks'), "error")
    }
  }, [t])

  const handleBuyCredits = async (credits: number, priceId: string) => {
    if (!companyId) return addToast(t('subscription.errors.companyNotFound'), "error")
    setIsProcessingPayment(true)

    try {
   
    const url = new URL(window.location.href)  // preserve path and existing params
    url.searchParams.set('success_credit', '1')
    url.searchParams.set('company_id', companyId)
    const returnUrl = url.toString()

    const cancelUrlObj = new URL(window.location.href)
    cancelUrlObj.searchParams.set('canceled_credit', '1')
    cancelUrlObj.searchParams.set('company_id', companyId)
    const cancelUrl = cancelUrlObj.toString()
      const {
        data: { session: freshSession },
      } = await supabase.auth.getSession()
      if (!freshSession?.access_token) {
        addToast(t('subscription.errors.startPayment'), "error")
        setIsProcessingPayment(false)
        return
      }

      const res = await fetch("/api/stripe/create-credit-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${freshSession.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          credits,
          return_url: returnUrl,
          cancel_url: cancelUrl,
        }),
      })

      const data = await res.json()
      if (data.sessionId) {
        const stripe = await stripePromise
        if (!stripe) throw new Error("Stripe failed to load")
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      } else {
        addToast(data.error || t('subscription.errors.startPayment'), "error")
      }
    } catch (err) {
      console.error(safeErrorInfo(err))
      addToast(t('subscription.errors.createCheckout'), "error")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const fetchUserCompanyId = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', userId)
        .single()
      
      if (error || !data?.company_id) {
        addToast(t('subscription.errors.fetchCompany'))
        return
      }

      setCompanyId(data.company_id.toString())
      const { data: companyData, error: compErr } = await supabase
        .from('company')
        .select('forfait, used_ai_credits')
        .eq('id', data.company_id)
        .single()


      if (compErr) {
        addToast(t('subscription.errors.fetchCompanyDetails'))
        return
      }

      if (companyData?.forfait) setCurrentPlan(companyData.forfait)
      setCurrentAICredits(companyData?.used_ai_credits ?? 0)
    } catch (err) {
      console.error('Error fetching company ID:', safeErrorInfo(err))
      addToast(t('subscription.errors.unexpectedCompany'))
    } finally {
      setLoadingSubscription(false)
    }
  }, [t])

  const getCompanyIdFromUrl = useCallback(() => {
    const companyIdParam = searchParams.get('company_id')
    if (companyIdParam) return companyIdParam
    
    const pathname = window.location.pathname
    const companyMatch = pathname.match(/\/company\/(\d+)\//)
    if (companyMatch) return companyMatch[1]
    
    return null
  }, [searchParams])

const fetchCompanyDetails = useCallback(async (companyId: string) => {
  try {
    // 1️⃣ Get the company and its current forfait
    const { data: companyData, error: compErr } = await supabase
      .from('company')
      .select('forfait, used_ai_credits')
      .eq('id', companyId)
      .single()

    if (compErr || !companyData) {
      addToast(t('subscription.errors.fetchCompanyDetails'))
      return
    }
    console.log("Currently Used AI credit:", companyData.used_ai_credits)
    setCurrentPlan(companyData.forfait)
    setCurrentAICredits(companyData.used_ai_credits ?? 0)

    // 2️⃣ Fetch the forfait details to get included_ai_credits
    if (companyData.forfait) {
      const { data: forfaitData, error: forfaitErr } = await supabase
        .from('forfait')
        .select('included_ai_credits')
        .eq('forfait_name', companyData.forfait)
        .single()

      if (forfaitErr || !forfaitData) {
        addToast(t('subscription.errors.fetchPlanDetails'))
        setIncludedAICredits(0)
      } else {
        setIncludedAICredits(forfaitData.included_ai_credits ?? 0)
        console.log("AI credit in forfait:", forfaitData.included_ai_credits)
      }
    } else {
      setIncludedAICredits(0)
    }
  } catch (err) {
    console.error('Error fetching company details:', safeErrorInfo(err))
    addToast(t('subscription.errors.unexpectedCompany'))
  } finally {
    setLoadingSubscription(false)
  }
}, [t])


  // Employee count, active billing interval, and whether a Stripe
  // subscription already exists - none of this is available from the
  // direct company_to_users/company Supabase reads above, so it's fetched
  // from the authenticated /api/stripe/subscription endpoint instead.
  const fetchSubscriptionDetails = useCallback(async () => {
    try {
      const {
        data: { session: freshSession },
      } = await supabase.auth.getSession()
      if (!freshSession?.access_token) return

      const res = await fetch('/api/stripe/subscription', {
        headers: { Authorization: `Bearer ${freshSession.access_token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (data?.subscription) setSubscription(data.subscription as Subscription)
    } catch (err) {
      console.error('Error fetching subscription details:', safeErrorInfo(err))
    }
  }, [])

  const handleManageBilling = async () => {
    setIsManagingBilling(true)
    try {
      const {
        data: { session: freshSession },
      } = await supabase.auth.getSession()
      if (!freshSession?.access_token) {
        addToast(t('subscription.errors.unableCheckout'), "error")
        return
      }

      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${freshSession.access_token}`,
        },
        body: JSON.stringify({ return_url: window.location.href }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        addToast(data.error || t('subscription.errors.unableCheckout'), "error")
      }
    } catch (err) {
      console.error(safeErrorInfo(err))
      addToast(t('subscription.errors.unexpectedCheckout'), "error")
    } finally {
      setIsManagingBilling(false)
    }
  }

  const generateDescription = useCallback((forfait: ForfaitData) => {
    if (!forfait.base_fee_huf) return t('subscription.plan.defaultDescription')
    return t('subscription.plan.paidDescription')
  }, [t])

  // Core and Growth share recruitment, time & attendance, absences, and
  // medical certificate uploads - Growth additionally includes performance
  // management, the AI wellbeing chatbot, and advanced reporting. Free's
  // feature list stays as-is (untouched by this pricing overhaul).
  const generateFeatures = useCallback((forfait: ForfaitData) => {
    if (!forfait.base_fee_huf) {
      const features: string[] = []
      if (forfait.max_opened_position) {
        features.push(t('subscription.features.maxPositions', { count: forfait.max_opened_position }))
      }
      if (forfait.max_medical_certificates) {
        features.push(t('subscription.features.maxCertificates', { count: forfait.max_medical_certificates }))
      }
      return features
    }

    const features: string[] = [
      t('subscription.features.recruitment'),
      t('subscription.features.attendanceAbsences'),
      t('subscription.features.medicalCertificates'),
    ]
    if (forfait.access_performance) features.push(t('subscription.features.performance'))
    if (forfait.access_happy_check) features.push(t('subscription.features.happyCheck'))
    if (forfait.access_advanced_reporting) features.push(t('subscription.features.advancedReporting'))
    return features
  }, [t])

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true)
    try {
      const { data: forfaits, error } = await supabase
        .from('forfait')
        .select('*')
        .order('id')

      if (error) {
        addToast(t('subscription.errors.fetchPlans'))
        return
      }

      if (forfaits) {
        const formattedPlans: Plan[] = forfaits.map((forfait: ForfaitData, index: number) => ({
          id: forfait.id?.toString() || `forfait_${forfait.id}`,
          name: forfait.forfait_name || t('subscription.plan.defaultName', { id: forfait.id }),
          isFree: !forfait.base_fee_huf,
          baseFeeHuf: forfait.base_fee_huf ?? null,
          perSeatFeeHuf: forfait.per_seat_fee_huf ?? null,
          minEmployees: forfait.min_employees ?? null,
          maxEmployees: forfait.max_employees ?? null,
          description: forfait.description || generateDescription(forfait),
          features: generateFeatures(forfait),
          popular: index === 1,
          includedAICredits: forfait.included_ai_credits ?? 0,
        }))
        setPlans(formattedPlans)
      }
    } catch (err) {
      console.error(safeErrorInfo(err))
      addToast(t('subscription.errors.fetchPlans'))
    } finally {
      setLoadingPlans(false)
    }
  }, [t, generateDescription, generateFeatures])

  const handleSubscribe = async (plan: Plan) => {
    if (!companyId) return addToast(t('subscription.errors.companyNotAvailable'), "error")
    if (plan.isFree) {
      addToast(t('subscription.messages.freePlan'), "success")
      return
    }
    // Switching tier/interval on an already-subscribed company isn't
    // supported yet - create-subscription would create a second, duplicate
    // Stripe subscription rather than modifying the existing one. Direct
    // those companies to the billing portal instead (see handleManageBilling).
    if (subscription?.hasStripeSubscription) {
      addToast(t('subscription.errors.alreadySubscribed'), "error")
      return
    }
    // Defense in depth - the button is already disabled for this case, but
    // create-subscription/route.ts is the real enforcement point regardless.
    if (subscription != null) {
      if (plan.maxEmployees !== null && subscription.employeeCount > plan.maxEmployees) {
        addToast(t('subscription.errors.tooManyEmployeesForPlan', { plan: plan.name, max: plan.maxEmployees, count: subscription.employeeCount }), "error")
        return
      }
      if (plan.minEmployees !== null && subscription.employeeCount < plan.minEmployees) {
        addToast(t('subscription.errors.tooFewEmployeesForPlan', { plan: plan.name, min: plan.minEmployees, count: subscription.employeeCount }), "error")
        return
      }
    }

    try {
      const {
        data: { session: freshSession },
      } = await supabase.auth.getSession()
      if (!freshSession?.access_token) {
        addToast(t('subscription.errors.unableCheckout'), "error")
        return
      }

      const res = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${freshSession.access_token}`,
        },
        body: JSON.stringify({
          tier: plan.name,
          interval: billingInterval,
          return_url: window.location.href,
          assisted_onboarding: assistedOnboarding && !subscription?.onboardingFeePaid,
        }),
      })

      const data = await res.json()
      if (data.sessionId) {
        const stripe = await stripePromise
        if (!stripe) throw new Error("Stripe failed to load")
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      } else {
        addToast(data.error || t('subscription.errors.unableCheckout'), "error")
      }
    } catch (err) {
      console.error(safeErrorInfo(err))
      addToast(t('subscription.errors.unexpectedCheckout'), "error")
    }
  }

  const formatPrice = (price: number) => price === 0 ? t('subscription.pricing.free') : price.toLocaleString()

  // Cached forfait amounts (base_fee_huf, per_seat_fee_huf) are always the
  // MONTHLY figures - annual pricing is 15% off the annualized monthly
  // total, computed the same way scripts/stripe-setup-pricing.mjs computes
  // the real annual Stripe Price amounts, so this display always matches
  // what gets billed.
  const annualizedIfNeeded = (monthlyHuf: number, interval: 'month' | 'year') =>
    interval === 'year' ? Math.round(monthlyHuf * 12 * 0.85) : monthlyHuf

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserCompanyId(session.user.id)
    } else {
      const urlCompanyId = getCompanyIdFromUrl()
      if (urlCompanyId) {
        setCompanyId(urlCompanyId)
        fetchCompanyDetails(urlCompanyId)
      } else {
        setLoadingSubscription(false)
      }
    }
    fetchPlans()
    fetchAICreditPacks()
    fetchSubscriptionDetails()
  }, [session?.user?.id, fetchUserCompanyId, getCompanyIdFromUrl, fetchCompanyDetails, fetchPlans, fetchAICreditPacks, fetchSubscriptionDetails])

  useEffect(() => {
    const successCredit = searchParams.get("success_credit")
    const canceledCredit = searchParams.get("canceled_credit")

    if (successCredit && companyId) {
      addToast(t('subscription.messages.creditsAdded'), "success")
      setTimeout(() => fetchCompanyDetails(companyId), 2000)
    }
    if (canceledCredit) addToast(t('subscription.messages.creditsCanceled'), "error")
  }, [searchParams, companyId, fetchCompanyDetails, t])

  useEffect(() => {
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")

    if (success && companyId) {
      setIsProcessingPayment(true)
      addToast(t('subscription.messages.paymentSuccess'), "success")
      setTimeout(async () => {
        await fetchCompanyDetails(companyId)
        await fetchSubscriptionDetails()
        setIsProcessingPayment(false)
        addToast(t('subscription.messages.subscriptionUpdated'), "success")
      }, 2000)
    }

    if (canceled) addToast(t('subscription.messages.paymentCanceled'), "error")
  }, [searchParams, companyId, fetchCompanyDetails, fetchSubscriptionDetails, t])

const remainingAICredits = (includedAICredits ?? 0) - (currentAICredits ?? 0)


  const perLabel = billingInterval === 'year' ? t('subscription.pricing.perYear') : t('subscription.pricing.perMonth')

  return (
    <div className={pageClass}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-slate-900">{t('subscription.header.title')}</h1>
          <p className="text-slate-500 mt-1">{t('subscription.header.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Processing payment */}
        {isProcessingPayment && (
          <div className={`${cardClass} p-5 flex items-center gap-4`} role="status">
            <Loader2 className="w-6 h-6 text-brand-600 animate-spin flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900">{t('subscription.processing.title')}</h3>
              <p className="text-sm text-slate-500">{t('subscription.processing.message')}</p>
            </div>
          </div>
        )}

        {/* Current subscription + AI credits */}
        {loadingSubscription ? (
          <div className={`${cardClass} p-6 animate-pulse h-32`} />
        ) : (
          <section className={`${cardClass} p-6`} aria-labelledby="current-plan-title">
            <p id="current-plan-title" className={`${eyebrowClass} mb-3`}>
              {currentPlan ? t('subscription.current.title') : t('subscription.noSubscription.title')}
            </p>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {currentPlan ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-10 gap-y-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-2xl font-semibold text-slate-900">{currentPlan}</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                        {t('subscription.current.active')}
                      </span>
                    </div>
                    {subscription?.hasStripeSubscription && (() => {
                      const plan = plans.find(p => p.name.toLowerCase() === currentPlan?.toLowerCase())
                      if (!plan || plan.baseFeeHuf === null || plan.perSeatFeeHuf === null) return null
                      const total = plan.baseFeeHuf + plan.perSeatFeeHuf * subscription.employeeCount
                      return (
                        <p className="text-sm text-slate-500 mt-1">
                          {t('subscription.current.costBreakdown', {
                            base: plan.baseFeeHuf.toLocaleString(),
                            count: subscription.employeeCount,
                            perSeat: plan.perSeatFeeHuf.toLocaleString(),
                            total: total.toLocaleString(),
                            interval: subscription.billingInterval === 'year' ? t('subscription.pricing.perYear') : t('subscription.pricing.perMonth'),
                          })}
                        </p>
                      )
                    })()}
                  </div>
                  {remainingAICredits !== null && (
                    <div className="sm:border-l sm:border-slate-200 sm:pl-10">
                      <p className="font-heading text-2xl font-semibold text-slate-900 tabular-nums">{remainingAICredits}</p>
                      <p className="text-sm text-slate-500">{t('subscription.current.creditsRemaining')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-600">{t('subscription.noSubscription.message')}</p>
              )}
              {subscription?.hasStripeSubscription && (
                <button
                  onClick={handleManageBilling}
                  disabled={isManagingBilling}
                  className={buttonClass('secondary', 'md', 'self-start md:self-auto')}
                >
                  <CreditCard className="w-4 h-4" />
                  {t('subscription.buttons.manageBilling')}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Plans */}
        <section aria-labelledby="plans-title" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2 id="plans-title" className={eyebrowClass}>{t('subscription.plansTitle')}</h2>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1" role="group">
              {(['month', 'year'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setBillingInterval(value)}
                  aria-pressed={billingInterval === value}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    billingInterval === value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {value === 'month' ? t('subscription.toggle.monthly') : t('subscription.toggle.annual')}
                </button>
              ))}
            </div>
          </div>

          {subscription && !subscription.hasStripeSubscription && !subscription.onboardingFeePaid && (
            <label className={`${cardClass} flex items-start gap-3 p-4 cursor-pointer hover:border-slate-300`}>
              <input
                type="checkbox"
                checked={assistedOnboarding}
                onChange={(e) => setAssistedOnboarding(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-600"
              />
              <span className="text-sm">
                <span className="font-medium text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {t('onboardingWizard.plan.assistedTitle', { fee: ASSISTED_ONBOARDING_FEE_HUF.toLocaleString() })}
                </span>
                <span className="text-slate-500 block mt-0.5">{t('onboardingWizard.plan.assistedBody')}</span>
              </span>
            </label>
          )}

          {loadingPlans ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className={`${cardClass} p-6 animate-pulse h-64`} />)}
            </div>
          ) : plans.length === 0 ? (
            <div className={`${cardClass} p-8 text-center`}>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('subscription.noPlans.title')}</h3>
              <p className="text-slate-500">{t('subscription.noPlans.message')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map(plan => {
                const isCurrent = plan.name.toLowerCase() === currentPlan?.toLowerCase()
                const blockedByExistingSubscription = !plan.isFree && !isCurrent && !!subscription?.hasStripeSubscription
                // Core's per-seat formula crosses over to cost more than
                // Growth's past a certain headcount despite Growth
                // including strictly more features - self-serve
                // subscribing into that zone is blocked here (mirrors
                // the hard check in create-subscription/route.ts).
                const ineligibleByHeadcount =
                  !plan.isFree &&
                  !isCurrent &&
                  !blockedByExistingSubscription &&
                  subscription != null &&
                  ((plan.maxEmployees !== null && subscription.employeeCount > plan.maxEmployees) ||
                    (plan.minEmployees !== null && subscription.employeeCount < plan.minEmployees))
                const canSubscribe = !(plan.isFree || isCurrent || blockedByExistingSubscription || ineligibleByHeadcount)
                return (
                  <div
                    key={plan.id}
                    className={`${cardClass} flex flex-col p-6 ${isCurrent ? 'border-brand-600 ring-1 ring-brand-600' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-heading text-lg font-semibold text-slate-900">{plan.name}</h3>
                      {isCurrent && (
                        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                          {t('subscription.badges.currentPlan')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-5">{plan.description}</p>

                    <div className="mb-1">
                      {plan.isFree || plan.baseFeeHuf === null ? (
                        <span className="font-heading text-3xl font-semibold text-slate-900">{t('subscription.pricing.free')}</span>
                      ) : (
                        <>
                          <span className="font-heading text-3xl font-semibold text-slate-900 tabular-nums">{formatPrice(annualizedIfNeeded(plan.baseFeeHuf, billingInterval))}</span>
                          <span className="text-sm text-slate-500"> {t('subscription.pricing.baseFee')} {perLabel}</span>
                        </>
                      )}
                    </div>
                    {!plan.isFree && plan.perSeatFeeHuf !== null && (
                      <p className="text-sm text-slate-500">
                        {t('subscription.pricing.perSeat', {
                          price: formatPrice(annualizedIfNeeded(plan.perSeatFeeHuf, billingInterval)),
                          interval: perLabel,
                        })}
                      </p>
                    )}
                    {plan.maxEmployees !== null && (
                      <p className="text-xs text-slate-400 mt-1">{t('subscription.employeeRangeMax', { count: plan.maxEmployees })}</p>
                    )}
                    {plan.minEmployees !== null && (
                      <p className="text-xs text-slate-400 mt-1">{t('subscription.employeeRangeMin', { count: plan.minEmployees })}</p>
                    )}

                    <ul className="space-y-2.5 my-6 border-t border-slate-100 pt-5 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <Check className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {plan.includedAICredits !== undefined && (
                        <li className="flex items-start gap-2.5 text-sm text-slate-700">
                          <Check className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                          {t('subscription.features.aiCreditsIncluded', { count: plan.includedAICredits })}
                        </li>
                      )}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={!canSubscribe}
                      className={buttonClass(canSubscribe ? 'primary' : 'secondary', 'md', 'w-full')}
                    >
                      {plan.isFree
                        ? t('subscription.buttons.freePlan')
                        : isCurrent
                        ? t('subscription.buttons.currentPlan')
                        : blockedByExistingSubscription
                        ? t('subscription.buttons.manageBillingToChange')
                        : ineligibleByHeadcount
                        ? t('subscription.buttons.notEligible')
                        : t('subscription.buttons.subscribe', { plan: plan.name })}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* AI credit packs */}
        <section aria-labelledby="credits-title" className="space-y-4">
          <div>
            <h2 id="credits-title" className="font-heading text-xl font-semibold text-slate-900">{t('subscription.credits.title')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('subscription.credits.subtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {aiCreditPacks.map((pack) => (
              <div key={pack.id} className={`${cardClass} p-5 flex flex-col gap-4`}>
                <div className="flex items-center gap-3">
                  <span className={iconTileClass}><Zap className="w-5 h-5" /></span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{t('subscription.credits.packTitle', { count: pack.credits })}</h3>
                    <p className="text-sm text-slate-500 tabular-nums">{(pack.price / 100).toLocaleString()} {pack.currency}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 flex-1">{t('subscription.credits.packDescription')}</p>
                <button
                  onClick={() => handleBuyCredits(pack.credits, pack.stripe_price_id)}
                  className={buttonClass('secondary', 'md', 'w-full')}
                >
                  {t('subscription.credits.buyButton', { count: pack.credits })}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Toast notifications */}
        <div className="fixed top-5 right-5 flex flex-col gap-2 z-40" aria-live="polite">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm text-white font-medium ${t.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
