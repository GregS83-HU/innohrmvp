'use client'

import { useEffect, useState, useCallback } from "react"
import { createClient } from '@supabase/supabase-js'
import { useSession } from '@supabase/auth-helpers-react'
import { useSearchParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Check, X, Star, Zap, Shield, Crown } from 'lucide-react'
import { loadStripe } from "@stripe/stripe-js"
import { useLocale } from '../../../../i18n/LocaleProvider'
import { safeErrorInfo } from '../../../../../lib/logSafe';

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

  const generateDescription = (forfait: ForfaitData) => {
    if (!forfait.base_fee_huf) return t('subscription.plan.defaultDescription')
    return t('subscription.plan.paidDescription')
  }

  // Core and Growth share recruitment, time & attendance, absences, and
  // medical certificate uploads - Growth additionally includes performance
  // management, the AI wellbeing chatbot, and advanced reporting. Free's
  // feature list stays as-is (untouched by this pricing overhaul).
  const generateFeatures = (forfait: ForfaitData) => {
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
  }

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
  }, [t])

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
          return_url: window.location.href
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

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter': return <Zap className="w-8 h-8 text-blue-600" />
      case 'professional': return <Star className="w-8 h-8 text-purple-600" />
      case 'enterprise': return <Crown className="w-8 h-8 text-yellow-600" />
      default: return <Shield className="w-8 h-8 text-gray-600" />
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('subscription.header.title')}</h1>
          <p className="text-gray-600 mt-2">{t('subscription.header.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Processing Payment Overlay */}
        {isProcessingPayment && (
          <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-6 mb-12">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">{t('subscription.processing.title')}</h3>
                <p className="text-blue-700">{t('subscription.processing.message')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Subscription with AI Credits */}
        {loadingSubscription ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-12 animate-pulse h-32" />
        ) : currentPlan ? (
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg p-6 mb-12 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{t('subscription.current.title')}</h2>
                <p className="text-lg mb-2">
                  <span className="font-bold">{currentPlan}</span> {t('subscription.current.plan')}
                  <span className="ml-4 px-3 py-1 bg-white/20 rounded-full text-sm">{t('subscription.current.active')}</span>
                </p>
                {subscription?.hasStripeSubscription && (() => {
                  const plan = plans.find(p => p.name.toLowerCase() === currentPlan?.toLowerCase())
                  if (!plan || plan.baseFeeHuf === null || plan.perSeatFeeHuf === null) return null
                  const total = plan.baseFeeHuf + plan.perSeatFeeHuf * subscription.employeeCount
                  return (
                    <p className="text-lg mb-2">
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
                {remainingAICredits !== null && (
                  <p className="text-lg">
                    <span className="font-bold">{remainingAICredits}</span> {t('subscription.current.creditsRemaining')}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center gap-3 mt-4 md:mt-0">
                <Shield className="w-12 h-12 text-white/80" />
                {subscription?.hasStripeSubscription && (
                  <button
                    onClick={handleManageBilling}
                    disabled={isManagingBilling}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {t('subscription.buttons.manageBilling')}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl shadow-lg p-6 mb-12 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{t('subscription.noSubscription.title')}</h2>
                <p className="text-lg">{t('subscription.noSubscription.message')}</p>
              </div>
              <Shield className="w-12 h-12 text-white/80" />
            </div>
          </div>
        )}

        {/* Billing interval toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full shadow-sm p-1 inline-flex">
            <button
              onClick={() => setBillingInterval('month')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${billingInterval === 'month' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              {t('subscription.toggle.monthly')}
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${billingInterval === 'year' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              {t('subscription.toggle.annual')}
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {loadingPlans ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse h-64" />)}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('subscription.noPlans.title')}</h3>
              <p className="text-gray-600">{t('subscription.noPlans.message')}</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.id} className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.name.toLowerCase() === currentPlan?.toLowerCase() ? 'ring-2 ring-green-500 scale-105 bg-green-50' : ''}`}>
                {plan.name.toLowerCase() === currentPlan?.toLowerCase() && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-green-600 to-green-500 text-white px-4 py-1 text-sm font-semibold">{t('subscription.badges.currentPlan')}</div>
                )}
                <div className="p-8">
                  <div className="flex items-center mb-4">{getPlanIcon(plan.name)}<h3 className="text-2xl font-bold text-gray-900 ml-3">{plan.name}</h3></div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-2">
                    {plan.isFree || plan.baseFeeHuf === null ? (
                      <span className="text-4xl font-bold text-green-600">{t('subscription.pricing.free')}</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">{formatPrice(annualizedIfNeeded(plan.baseFeeHuf, billingInterval))}</span>
                        <span className="text-gray-600"> {t('subscription.pricing.baseFee')} {billingInterval === 'year' ? t('subscription.pricing.perYear') : t('subscription.pricing.perMonth')}</span>
                      </>
                    )}
                  </div>
                  {!plan.isFree && plan.perSeatFeeHuf !== null && (
                    <p className="text-sm text-gray-500 mb-1">
                      {t('subscription.pricing.perSeat', {
                        price: formatPrice(annualizedIfNeeded(plan.perSeatFeeHuf, billingInterval)),
                        interval: billingInterval === 'year' ? t('subscription.pricing.perYear') : t('subscription.pricing.perMonth'),
                      })}
                    </p>
                  )}
                  {plan.maxEmployees !== null && (
                    <p className="text-xs text-gray-400 mb-8">{t('subscription.employeeRangeMax', { count: plan.maxEmployees })}</p>
                  )}
                  {plan.minEmployees !== null && (
                    <p className="text-xs text-gray-400 mb-8">{t('subscription.employeeRangeMin', { count: plan.minEmployees })}</p>
                  )}
                  {(plan.isFree || plan.perSeatFeeHuf === null) && plan.minEmployees === null && plan.maxEmployees === null && <div className="mb-8" />}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => <li key={idx} className="flex items-center text-gray-700"><Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />{feature}</li>)}
                    {plan.includedAICredits !== undefined && (
                    <li className="flex items-center text-gray-700">
                      <Zap className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                      {t('subscription.features.aiCreditsIncluded', { count: plan.includedAICredits })}
                    </li>
                  )}
                  </ul>
                  {(() => {
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
                    const disabled = plan.isFree || isCurrent || blockedByExistingSubscription || ineligibleByHeadcount
                    return (
                      <button
                        onClick={() => handleSubscribe(plan)}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                          plan.isFree
                            ? 'bg-green-100 text-green-800 cursor-default'
                            : isCurrent
                            ? 'bg-blue-100 text-blue-800 cursor-default'
                            : blockedByExistingSubscription || ineligibleByHeadcount
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                        }`}
                        disabled={disabled}
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
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Buy AI Credits Section --- */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('subscription.credits.title')}</h2>
          <p className="text-gray-600 mb-10">{t('subscription.credits.subtitle')}</p>

          <div className="grid md:grid-cols-3 gap-8">
            {aiCreditPacks.map((pack) => (
              <div key={pack.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all">
                <div className="flex items-center mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900 ml-3">
                    {t('subscription.credits.packTitle', { count: pack.credits })}
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  {t('subscription.credits.packDescription')}
                </p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900">
                    {(pack.price / 100).toLocaleString()} {pack.currency} 
                  </span>
                </div>
                <button
                  onClick={() => handleBuyCredits(pack.credits, pack.stripe_price_id)}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                >
                  {t('subscription.credits.buyButton', { count: pack.credits })}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Toast Notifications */}
        <div className="fixed top-5 right-5 flex flex-col gap-2 z-40">
          {toasts.map(t => (
            <div key={t.id} className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all ${t.type === 'error' ? 'bg-red-500' : 'bg-green-500'} animate-in slide-in-from-right`}>
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}