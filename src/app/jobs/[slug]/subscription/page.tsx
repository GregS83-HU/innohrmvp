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

// Define proper types for database objects
interface ForfaitData {
  id: number
  forfait_name?: string
  description?: string
  max_opened_position?: number
  max_medical_certificates?: number
  access_happy_check?: boolean
  stripe_price_id?: string | null
}

interface StripePriceData {
  id: string
  name: string
  price?: number
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
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

  const addToast = (message: string, type: 'success' | 'error' = 'error') => {
    const id = uuidv4()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
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
        .select('forfait')
        .eq('id', data.company_id)
        .single()

      if (compErr) {
        addToast('Failed to fetch company details')
        return
      }

      if (companyData?.forfait) setCurrentPlan(companyData.forfait)
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
      const { data: companyData, error: compErr } = await supabase
        .from('company')
        .select('forfait')
        .eq('id', companyId)
        .single()

      if (compErr) {
        addToast('Failed to fetch company details')
        return
      }

      if (companyData?.forfait) setCurrentPlan(companyData.forfait)
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
    
    if (paidPlans.length === 0) {
      // All plans are free, no need to call Stripe
      return
    }

    try {
      const res = await fetch('/api/stripe/prices')
      if (!res.ok) {
        addToast("Failed to load pricing from Stripe. Paid plans are temporarily unavailable.", "error")
        // Only show free plans when Stripe fails
        const freePlansOnly = plansToUpdate.filter(plan => plan.priceId === null)
        setPlans(freePlansOnly)
        return
      }
      
      const data = await res.json()
      if (!data.prices || !Array.isArray(data.prices)) {
        addToast("Invalid pricing data from Stripe. Paid plans are temporarily unavailable.", "error")
        // Only show free plans when Stripe data is invalid
        const freePlansOnly = plansToUpdate.filter(plan => plan.priceId === null)
        setPlans(freePlansOnly)
        return
      }

      let hasStripePricingIssues = false
      const updatedPlans = plansToUpdate
        .map(plan => {
          // If it's a free plan (no stripe_price_id), keep it as is
          if (plan.priceId === null) {
            return plan
          }
          
          // For paid plans, find the price in Stripe data
          const stripePrice = data.prices.find((p: StripePriceData) => p.id === plan.priceId)
          if (stripePrice && typeof stripePrice.price === 'number') {
            return { ...plan, price: stripePrice.price }
          } else {
            // Stripe price not found or invalid for this paid plan
            hasStripePricingIssues = true
            return null
          }
        })
        .filter(plan => plan !== null) as Plan[]

      if (hasStripePricingIssues) {
        addToast("Some paid plans are temporarily unavailable due to pricing issues.", "error")
      }
      
      setPlans(updatedPlans)
    } catch (err) {
      console.error("Error fetching Stripe prices:", err)
      addToast("Could not connect to Stripe. Paid plans are temporarily unavailable.", "error")
      // Only show free plans when Stripe connection fails
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
          price: 0, // Will be updated from Stripe for paid plans
          description: forfait.description || generateDescription(forfait),
          features: generateFeatures(forfait),
          popular: index === 1,
          priceId: forfait.stripe_price_id || null // Use stripe_price_id from database
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
        return_url: window.location.origin // better than href
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
    if (session?.user?.id) fetchUserCompanyId(session.user.id)
    else {
      const urlCompanyId = getCompanyIdFromUrl()
      if (urlCompanyId) fetchCompanyDetails(urlCompanyId)
      else setLoadingSubscription(false)
    }
    fetchPlans()
  }, [session?.user?.id, fetchUserCompanyId, getCompanyIdFromUrl, fetchCompanyDetails, fetchPlans])

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
        {loadingSubscription ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-12 animate-pulse h-32" />
        ) : currentPlan ? (
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg p-6 mb-12 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Current Subscription</h2>
                <p className="text-lg">
                  <span className="font-bold">{currentPlan}</span> Plan
                  <span className="ml-4 px-3 py-1 bg-white/20 rounded-full text-sm">Active</span>
                </p>
              </div>
              <Shield className="w-12 h-12 text-white/80" />
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
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      // Free plan button
                      plan.priceId === null 
                        ? 'bg-green-100 text-green-800 cursor-default' 
                        // Paid plan with pricing issues
                        : (plan.price === 0 && plan.priceId !== null)
                        ? 'bg-red-100 text-red-800 cursor-not-allowed'
                        // Current plan
                        : plan.name.toLowerCase() === currentPlan?.toLowerCase() 
                        ? 'bg-blue-100 text-blue-800' 
                        // Available paid plan
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
  )
}