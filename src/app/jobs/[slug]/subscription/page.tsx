'use client'

import { useEffect, useState, useCallback } from "react"
import { createClient } from '@supabase/supabase-js'
import { useSession } from '@supabase/auth-helpers-react'
import { useSearchParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Check, X, Star, Zap, Shield, Crown } from 'lucide-react'
import { loadStripe } from "@stripe/stripe-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Plan = { 
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
  priceId?: string | null
  includedAICredits?: number
}

type Subscription = { 
  plan: string
  status: string
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
  stripe_price_id?: string | null
  included_ai_credits?: number
}

interface StripePriceData {
  id: string
  name: string
  price?: number
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
        console.log("AI credit packs data:", creditPacks, "Error:", error)


      if (error || !creditPacks) {
        addToast("Failed to fetch AI credit packs", "error")
        return
      }

      const mappedPacks = creditPacks.map(pack => ({
      ...pack,
      stripe_price_id: pack.price_id
    }))

      setAICreditPacks(mappedPacks)
    } catch (err) {
      console.error(err)
      addToast("Unexpected error fetching AI credit packs", "error")
    }
  }, [])

  const handleBuyCredits = async (credits: number, priceId: string) => {
    if (!companyId) return addToast("Company not found", "error")
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
      const res = await fetch("/api/stripe/create-credit-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
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
        addToast(data.error || "Could not start payment", "error")
      }
    } catch (err) {
      console.error(err)
      addToast("Error creating checkout", "error")
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
        addToast("Failed to fetch company information.")
        return
      }

      setCompanyId(data.company_id.toString())
      const { data: companyData, error: compErr } = await supabase
        .from('company')
        .select('forfait, used_ai_credits')
        .eq('id', data.company_id)
        .single()


      if (compErr) {
        addToast('Failed to fetch company details')
        return
      }

      if (companyData?.forfait) setCurrentPlan(companyData.forfait)
      setCurrentAICredits(companyData?.used_ai_credits ?? 0)
    } catch (err) {
      console.error('Error fetching company ID:', err)
      addToast("Unexpected error fetching company information.")
    } finally {
      setLoadingSubscription(false)
    }
  }, [])

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
      addToast('Failed to fetch company details')
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
        addToast('Failed to fetch plan details')
        setIncludedAICredits(0)
      } else {
        setIncludedAICredits(forfaitData.included_ai_credits ?? 0)
        console.log("AI credit in forfait:", forfaitData.included_ai_credits)
      }
    } else {
      setIncludedAICredits(0)
    }
  } catch (err) {
    console.error('Error fetching company details:', err)
    addToast("Unexpected error fetching company information.")
  } finally {
    setLoadingSubscription(false)
  }
}, [])


  const generateDescription = (forfait: ForfaitData) => {
    const features: string[] = []
    if (forfait.max_opened_position) features.push(`${forfait.max_opened_position} positions`)
    if (forfait.max_medical_certificates) features.push(`${forfait.max_medical_certificates} certificates`)
    if (forfait.access_happy_check) features.push('Happy Check access')
    return features.length > 0 ? `Perfect for businesses needing ${features.join(', ')}` : 'A great plan for your business needs'
  }

  const generateFeatures = (forfait: ForfaitData) => {
    const features: string[] = []
    if (forfait.max_opened_position) features.push(forfait.max_opened_position === 999999 ? 'Unlimited open positions' : `Up to ${forfait.max_opened_position} open positions`)
    if (forfait.max_medical_certificates) features.push(forfait.max_medical_certificates === 999999 ? 'Unlimited medical certificates' : `Up to ${forfait.max_medical_certificates} medical certificates`)
    if (forfait.access_happy_check) features.push('Happy Check feature included')
    features.push('Email support', 'Basic analytics', 'Secure data storage')
    return features
  }

  const fetchStripePrices = useCallback(async (plansToUpdate: Plan[]) => {
    const paidPlans = plansToUpdate.filter(plan => plan.priceId !== null)
    if (paidPlans.length === 0) return

    try {
      const res = await fetch('/api/stripe/prices')
      if (!res.ok) {
        addToast("Failed to load pricing from Stripe. Paid plans are temporarily unavailable.", "error")
        const freePlansOnly = plansToUpdate.filter(plan => plan.priceId === null)
        setPlans(freePlansOnly)
        return
      }
      
      const data = await res.json()
      if (!data.prices || !Array.isArray(data.prices)) {
        addToast("Invalid pricing data from Stripe. Paid plans are temporarily unavailable.", "error")
        const freePlansOnly = plansToUpdate.filter(plan => plan.priceId === null)
        setPlans(freePlansOnly)
        return
      }

      let hasStripePricingIssues = false
      const updatedPlans = plansToUpdate
        .map(plan => {
          if (plan.priceId === null) return plan
          const stripePrice = data.prices.find((p: StripePriceData) => p.id === plan.priceId)
          if (stripePrice && typeof stripePrice.price === 'number') return { ...plan, price: stripePrice.price }
          hasStripePricingIssues = true
          return null
        })
        .filter(plan => plan !== null) as Plan[]

      if (hasStripePricingIssues) addToast("Some paid plans are temporarily unavailable due to pricing issues.", "error")
      
      setPlans(updatedPlans)
    } catch (err) {
      console.error("Error fetching Stripe prices:", err)
      addToast("Could not connect to Stripe. Paid plans are temporarily unavailable.", "error")
      const freePlansOnly = plansToUpdate.filter(plan => plan.priceId === null)
      setPlans(freePlansOnly)
    }
  }, [])

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true)
    try {
      const { data: forfaits, error } = await supabase
        .from('forfait')
        .select('*')
        .order('id')

      if (error) {
        addToast("Failed to fetch plans")
        return
      }

      if (forfaits) {
        const formattedPlans: Plan[] = forfaits.map((forfait: ForfaitData, index: number) => ({
          id: forfait.id?.toString() || `forfait_${forfait.id}`,
          name: forfait.forfait_name || `Plan ${forfait.id}`,
          price: 0,
          description: forfait.description || generateDescription(forfait),
          features: generateFeatures(forfait),
          popular: index === 1,
          priceId: forfait.stripe_price_id || null,
          includedAICredits: forfait.included_ai_credits ?? 0,
        }))
        setPlans(formattedPlans)
        await fetchStripePrices(formattedPlans)
      }
    } catch (err) {
      console.error(err)
      addToast("Failed to fetch plans")
    } finally {
      setLoadingPlans(false)
    }
  }, [fetchStripePrices])

  const handleSubscribe = async (plan: Plan) => {
    if (!companyId) return addToast("Company information not available.", "error")
    if (plan.priceId === null) {
      addToast("This is a free plan. No subscription needed.", "success")
      return
    }
    if (plan.price === 0 && plan.priceId !== null) {
      addToast("This plan is temporarily unavailable due to pricing issues.", "error")
      return
    }

    try {
      const res = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          price_id: plan.priceId,
          return_url: window.location.href
        }),
      })

      const data = await res.json()
      if (data.sessionId) {
        const stripe = await stripePromise
        if (!stripe) throw new Error("Stripe failed to load")
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      } else {
        addToast(data.error || "Unable to start checkout", "error")
      }
    } catch (err) {
      console.error(err)
      addToast("Unexpected error starting checkout", "error")
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

  const formatPrice = (price: number) => price === 0 ? 'Free' : (price/100).toLocaleString()

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
  }, [session?.user?.id, fetchUserCompanyId, getCompanyIdFromUrl, fetchCompanyDetails, fetchPlans, fetchAICreditPacks])

  useEffect(() => {
    const successCredit = searchParams.get("success_credit")
    const canceledCredit = searchParams.get("canceled_credit")

    if (successCredit && companyId) {
      addToast("AI credits added successfully!", "success")
      setTimeout(() => fetchCompanyDetails(companyId), 2000)
    }
    if (canceledCredit) addToast("AI credit purchase canceled", "error")
  }, [searchParams, companyId, fetchCompanyDetails])

  useEffect(() => {
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")

    if (success && companyId) {
      setIsProcessingPayment(true)
      addToast("Payment successful! Updating your subscription...", "success")
      setTimeout(async () => {
        await fetchCompanyDetails(companyId)
        setIsProcessingPayment(false)
        addToast("Subscription updated successfully!", "success")
      }, 2000)
    }

    if (canceled) addToast("Payment canceled", "error")
  }, [searchParams, companyId, fetchCompanyDetails])

const remainingAICredits = (includedAICredits ?? 0) - (currentAICredits ?? 0)


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Choose the perfect plan for your business needs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Processing Payment Overlay */}
        {isProcessingPayment && (
          <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-6 mb-12">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Processing your payment...</h3>
                <p className="text-blue-700">Please wait while we update your subscription.</p>
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
                <h2 className="text-xl font-semibold mb-2">Current Subscription</h2>
                <p className="text-lg mb-2">
                  <span className="font-bold">{currentPlan}</span> Plan
                  <span className="ml-4 px-3 py-1 bg-white/20 rounded-full text-sm">Active</span>
                </p>
                {remainingAICredits !== null && (
                  <p className="text-lg">
                    <span className="font-bold">{remainingAICredits}</span> AI Credits remaining
                  </p>
                )}
              </div>
              <Shield className="w-12 h-12 text-white/80 mt-4 md:mt-0" />
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl shadow-lg p-6 mb-12 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
                <p className="text-lg">Choose a plan to get started</p>
              </div>
              <Shield className="w-12 h-12 text-white/80" />
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {loadingPlans ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse h-64" />)}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plans Available</h3>
              <p className="text-gray-600">Unable to load pricing information. Please try again later.</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.id} className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.name.toLowerCase() === currentPlan?.toLowerCase() ? 'ring-2 ring-green-500 scale-105 bg-green-50' : ''}`}>
                {plan.name.toLowerCase() === currentPlan?.toLowerCase() && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-green-600 to-green-500 text-white px-4 py-1 text-sm font-semibold">Current Plan</div>
                )}
                <div className="p-8">
                  <div className="flex items-center mb-4">{getPlanIcon(plan.name)}<h3 className="text-2xl font-bold text-gray-900 ml-3">{plan.name}</h3></div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-8">
                    {plan.price === 0 ? <span className="text-4xl font-bold text-green-600">Free</span> : <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>}
                    {plan.price !== 0 && <span className="text-gray-600"> HUF/month</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => <li key={idx} className="flex items-center text-gray-700"><Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />{feature}</li>)}
                    {plan.includedAICredits !== undefined && (
                    <li className="flex items-center text-gray-700">
                      <Zap className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                      {plan.includedAICredits} AI Credits included
                    </li>
                  )}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      plan.priceId === null 
                        ? 'bg-green-100 text-green-800 cursor-default' 
                        : (plan.price === 0 && plan.priceId !== null)
                        ? 'bg-red-100 text-red-800 cursor-not-allowed'
                        : plan.name.toLowerCase() === currentPlan?.toLowerCase() 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                    disabled={plan.price === 0 && plan.priceId !== null}
                  >
                    {plan.priceId === null 
                      ? 'Free Plan' 
                      : (plan.price === 0 && plan.priceId !== null)
                      ? 'Temporarily Unavailable'
                      : plan.name.toLowerCase() === currentPlan?.toLowerCase()
                      ? 'Current Plan'
                      : `Subscribe to ${plan.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Buy AI Credits Section --- */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Buy AI Credits</h2>
          <p className="text-gray-600 mb-10">Need more AI power? Choose a credit pack below for one-time purchase.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {aiCreditPacks.map((pack) => (
              <div key={pack.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all">
                <div className="flex items-center mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900 ml-3">
                    {pack.credits} AI Credits
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Perfect for generating extra results or insights.
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
                  Buy {pack.credits} Credits
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
