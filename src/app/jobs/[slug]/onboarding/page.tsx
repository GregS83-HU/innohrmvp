'use client';

// Self-onboarding wizard. A company admin goes through:
//   1. Company  - confirm the company name
//   2. Team     - add employees (headcount decides Core vs Growth)
//   3. Plan     - Core/Growth, monthly/annual, optional assisted call
//   4. Payment  - Stripe Checkout (card saved, recurring billing starts)
// Gated modules unlock only once the first payment succeeds - the Stripe
// webhook flips company.onboarding_completed (see
// lib/onboarding/completeSelfOnboarding.ts). This page then polls until it
// sees that, and shows the "you're all set" screen.
//
// The [slug] in the URL is only used to build links: every API call here
// resolves the company from the signed-in admin's session.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  Building2, Users, CreditCard, CheckCircle2, Check, Phone, Loader2, ArrowRight, ArrowLeft, Lock, UserPlus,
} from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';
import { useLocale } from '../../../../i18n/LocaleProvider';
import { ASSISTED_ONBOARDING_FEE_HUF, annualizedIfNeeded } from '../../../../config/onboarding';

type WizardPlan = {
  name: string;
  baseFeeHuf: number | null;
  perSeatFeeHuf: number | null;
  minEmployees: number | null;
  maxEmployees: number | null;
  performance: boolean;
  wellbeingChatbot: boolean;
  advancedReporting: boolean;
  includedAiCredits: number;
  maxOpenPositions: number | null;
  assistedOnboardingAvailable: boolean;
};

type WizardCompany = {
  name: string | null;
  slug: string | null;
  plan: string | null;
  onboardingCompleted: boolean;
  hasSubscription: boolean;
  billingInterval: 'month' | 'year' | null;
  assistedOnboardingRequested: boolean;
  onboardingFeePaid: boolean;
  employeeCount: number;
};

type Step = 0 | 1 | 2;
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 30;

async function authHeaders(): Promise<Record<string, string> | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;
  return { Authorization: `Bearer ${session.access_token}` };
}

function isEligible(plan: WizardPlan, count: number) {
  if (plan.maxEmployees !== null && count > plan.maxEmployees) return false;
  if (plan.minEmployees !== null && count < plan.minEmployees) return false;
  return true;
}

const fmt = (n: number) => n.toLocaleString('hu-HU');

export default function OnboardingWizardPage() {
  const { t } = useLocale();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<'auth' | 'forbidden' | 'generic' | null>(null);
  const [company, setCompany] = useState<WizardCompany | null>(null);
  const [plans, setPlans] = useState<WizardPlan[]>([]);

  const [step, setStep] = useState<Step>(0);
  const [companyName, setCompanyName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [interval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [assisted, setAssisted] = useState(false);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const pollAttempts = useRef(0);

  const returnedFromCheckout = searchParams.get('success') === 'true';
  const checkoutCanceled = searchParams.get('canceled') === 'true';

  const load = useCallback(async (opts: { silent?: boolean } = {}) => {
    if (!opts.silent) setLoading(true);
    try {
      const headers = await authHeaders();
      if (!headers) {
        setLoadError('auth');
        return null;
      }
      const res = await fetch('/api/onboarding', { headers });
      if (res.status === 401) { setLoadError('auth'); return null; }
      if (res.status === 403) { setLoadError('forbidden'); return null; }
      if (!res.ok) { setLoadError('generic'); return null; }
      const data = await res.json();
      setLoadError(null);
      setCompany(data.company);
      setPlans(data.plans);
      return data.company as WizardCompany;
    } catch {
      setLoadError('generic');
      return null;
    } finally {
      if (!opts.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().then((c) => {
      if (!c) return;
      setCompanyName(c.name ?? '');
      if (returnedFromCheckout && !c.onboardingCompleted) setWaitingForPayment(true);
      if (checkoutCanceled) setStep(2);
    });
  }, [load, returnedFromCheckout, checkoutCanceled]);

  // Refresh headcount when the admin comes back from adding employees in
  // another tab.
  useEffect(() => {
    const onFocus = () => { if (step === 1) load({ silent: true }); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [step, load]);

  // After Stripe Checkout: wait for the webhook to mark onboarding complete.
  useEffect(() => {
    if (!waitingForPayment) return;
    pollAttempts.current = 0;
    const timer = window.setInterval(async () => {
      pollAttempts.current += 1;
      const c = await load({ silent: true });
      if (c?.onboardingCompleted) {
        setWaitingForPayment(false);
        window.clearInterval(timer);
      } else if (pollAttempts.current >= POLL_MAX_ATTEMPTS) {
        setWaitingForPayment(false);
        setPollTimedOut(true);
        window.clearInterval(timer);
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [waitingForPayment, load]);

  const employeeCount = company?.employeeCount ?? 0;
  const recommendedPlan = useMemo(
    () => plans.find((p) => isEligible(p, employeeCount))?.name ?? null,
    [plans, employeeCount]
  );

  useEffect(() => {
    if (!selectedPlan || !plans.find((p) => p.name === selectedPlan && isEligible(p, employeeCount))) {
      setSelectedPlan(recommendedPlan);
    }
  }, [recommendedPlan, selectedPlan, plans, employeeCount]);

  const plan = plans.find((p) => p.name === selectedPlan) ?? null;
  const assistedAvailable = !!plan?.assistedOnboardingAvailable && !company?.onboardingFeePaid;
  const seats = Math.max(employeeCount, 1);
  const recurringTotal =
    plan && plan.baseFeeHuf !== null && plan.perSeatFeeHuf !== null
      ? annualizedIfNeeded(plan.baseFeeHuf, interval) + annualizedIfNeeded(plan.perSeatFeeHuf, interval) * seats
      : null;
  const firstPayment = recurringTotal === null ? null : recurringTotal + (assisted && assistedAvailable ? ASSISTED_ONBOARDING_FEE_HUF : 0);
  const perLabel = interval === 'year' ? t('onboardingWizard.plan.perYear') : t('onboardingWizard.plan.perMonth');

  const saveNameAndContinue = async () => {
    setError('');
    const trimmed = companyName.trim();
    if (!trimmed) {
      setError(t('onboardingWizard.company.nameRequired'));
      return;
    }
    if (trimmed === (company?.name ?? '')) {
      setStep(1);
      return;
    }
    setSavingName(true);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
        body: JSON.stringify({ company_name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('onboardingWizard.errors.generic'));
      setCompany((c) => (c ? { ...c, name: data.name } : c));
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('onboardingWizard.errors.generic'));
    } finally {
      setSavingName(false);
    }
  };

  const startCheckout = async () => {
    if (!plan) return;
    setError('');
    setRedirecting(true);
    try {
      const headers = await authHeaders();
      if (!headers) throw new Error(t('onboardingWizard.errors.sessionExpired'));
      const returnUrl = `${window.location.origin}/jobs/${slug}/onboarding`;
      const res = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          tier: plan.name,
          interval,
          return_url: returnUrl,
          assisted_onboarding: assisted && assistedAvailable,
        }),
      });
      const data = await res.json();
      if (!data.sessionId) throw new Error(data.error || t('onboardingWizard.errors.checkout'));
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) throw new Error(t('onboardingWizard.errors.checkout'));
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('onboardingWizard.errors.checkout'));
      setRedirecting(false);
    }
  };

  // ---------- Render helpers ----------

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );

  if (loading) {
    return shell(
      <div className="flex justify-center py-24 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (loadError) {
    const message =
      loadError === 'auth'
        ? t('onboardingWizard.errors.notLoggedIn')
        : loadError === 'forbidden'
        ? t('onboardingWizard.errors.adminOnly')
        : t('onboardingWizard.errors.generic');
    return shell(
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-700 mb-6">{message}</p>
        <Link href={`/jobs/${slug}`} className="text-brand-600 font-medium hover:underline">
          {t('onboardingWizard.backToDashboard')}
        </Link>
      </div>
    );
  }

  if (!company) return null;

  // ----- Finished -----
  if (company.onboardingCompleted) {
    const unlocked = [
      { label: t('onboardingWizard.done.modules.attendance'), href: `/jobs/${slug}/time-clock/manager` },
      { label: t('onboardingWizard.done.modules.absences'), href: `/jobs/${slug}/absences` },
      { label: t('onboardingWizard.done.modules.certificates'), href: `/jobs/${slug}/medical-certificate/list` },
    ];
    const currentPlan = plans.find((p) => p.name === company.plan);
    if (currentPlan?.performance) unlocked.push({ label: t('onboardingWizard.done.modules.performance'), href: `/jobs/${slug}/performance` });
    if (currentPlan?.wellbeingChatbot) unlocked.push({ label: t('onboardingWizard.done.modules.wellbeing'), href: `/jobs/${slug}/happiness-dashboard` });

    return shell(
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('onboardingWizard.done.title')}</h1>
          <p className="text-gray-600">
            {company.plan ? t('onboardingWizard.done.subtitlePlan', { plan: company.plan }) : t('onboardingWizard.done.subtitle')}
          </p>
        </div>
        {company.assistedOnboardingRequested && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3 text-sm text-amber-900">
            <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{t('onboardingWizard.done.assisted')}</p>
          </div>
        )}
        <p className="text-sm font-medium text-gray-700 mb-3">{t('onboardingWizard.done.unlockedTitle')}</p>
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {unlocked.map((m) => (
            <Link key={m.href} href={m.href} className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" />{m.label}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link href={`/jobs/${slug}`} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-medium">
            {t('onboardingWizard.done.goToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  // ----- Paid, waiting for confirmation -----
  if (waitingForPayment || pollTimedOut || company.hasSubscription) {
    return shell(
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {waitingForPayment ? (
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-4" />
        ) : (
          <CreditCard className="w-10 h-10 text-brand-600 mx-auto mb-4" />
        )}
        <h1 className="text-xl font-semibold text-gray-900 mb-2">{t('onboardingWizard.waiting.title')}</h1>
        <p className="text-gray-600 mb-6">
          {waitingForPayment ? t('onboardingWizard.waiting.message') : t('onboardingWizard.waiting.slow')}
        </p>
        {!waitingForPayment && (
          <button
            onClick={() => { setPollTimedOut(false); setWaitingForPayment(true); }}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium"
          >
            {t('onboardingWizard.waiting.refresh')}
          </button>
        )}
      </div>
    );
  }

  // ----- Wizard -----
  const steps = [
    { icon: Building2, label: t('onboardingWizard.steps.company') },
    { icon: Users, label: t('onboardingWizard.steps.team') },
    { icon: CreditCard, label: t('onboardingWizard.steps.plan') },
  ];

  return shell(
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('onboardingWizard.title')}</h1>
        <p className="text-gray-600">{t('onboardingWizard.subtitle')}</p>
      </div>

      {/* Step indicator */}
      <ol className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
        {steps.map(({ icon: Icon, label }, i) => {
          const state = i < step ? 'done' : i === step ? 'current' : 'todo';
          return (
            <li key={label} className="flex items-center gap-2 sm:gap-4">
              <span className={`flex items-center gap-2 text-sm font-medium ${state === 'todo' ? 'text-gray-400' : 'text-gray-900'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  state === 'done' ? 'bg-green-100 text-green-700' : state === 'current' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {state === 'done' ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </span>
              {i < steps.length - 1 && <span className="w-6 sm:w-10 h-px bg-gray-300" />}
            </li>
          );
        })}
      </ol>

      {checkoutCanceled && step === 2 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 mb-4 text-sm">
          {t('onboardingWizard.plan.canceled')}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        {step === 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('onboardingWizard.company.title')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('onboardingWizard.company.subtitle')}</p>
            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('onboardingWizard.company.nameLabel')}
            </label>
            <input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              maxLength={120}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-2">{t('onboardingWizard.company.unlocksTitle')}</p>
              <p>{t('onboardingWizard.company.unlocksBody')}</p>
            </div>
            <div className="flex justify-between items-center mt-8">
              <Link href={`/jobs/${slug}`} className="text-sm text-gray-500 hover:text-gray-700">
                {t('onboardingWizard.skip')}
              </Link>
              <button
                onClick={saveNameAndContinue}
                disabled={savingName}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
              >
                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {t('onboardingWizard.next')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('onboardingWizard.team.title')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('onboardingWizard.team.subtitle')}</p>
            <div className="flex items-center justify-between gap-4 bg-gray-50 rounded-xl p-5 mb-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">{employeeCount}</p>
                <p className="text-sm text-gray-500">{t('onboardingWizard.team.activeEmployees')}</p>
              </div>
              <a
                href={`/jobs/${slug}/users-creation`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 border border-brand-600 text-brand-700 hover:bg-brand-50 px-4 py-2 rounded-lg text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" /> {t('onboardingWizard.team.addEmployees')}
              </a>
            </div>
            <p className="text-xs text-gray-500 mb-4">{t('onboardingWizard.team.hint')}</p>
            {recommendedPlan ? (
              <p className="text-sm text-gray-700">
                {t('onboardingWizard.team.recommended', { plan: recommendedPlan, count: employeeCount })}
              </p>
            ) : (
              <p className="text-sm text-red-600">{t('onboardingWizard.team.noPlan')}</p>
            )}
            <div className="flex justify-between items-center mt-8">
              <button onClick={() => setStep(0)} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> {t('onboardingWizard.back')}
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => load({ silent: true })} className="text-sm text-gray-500 hover:text-gray-700">
                  {t('onboardingWizard.team.refresh')}
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!recommendedPlan}
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
                >
                  {t('onboardingWizard.next')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('onboardingWizard.plan.title')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('onboardingWizard.plan.subtitle')}</p>

            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-full p-1 inline-flex">
                {(['month', 'year'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setBillingInterval(value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${interval === value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                  >
                    {value === 'month' ? t('onboardingWizard.plan.monthly') : t('onboardingWizard.plan.annual')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {plans.map((p) => {
                const eligible = isEligible(p, employeeCount);
                const selected = p.name === selectedPlan;
                const features = [
                  t('onboardingWizard.plan.features.recruitment'),
                  t('onboardingWizard.plan.features.attendance'),
                  t('onboardingWizard.plan.features.certificates'),
                  ...(p.performance ? [t('onboardingWizard.plan.features.performance')] : []),
                  ...(p.wellbeingChatbot ? [t('onboardingWizard.plan.features.wellbeing')] : []),
                  ...(p.advancedReporting ? [t('onboardingWizard.plan.features.reporting')] : []),
                  t('onboardingWizard.plan.features.aiCredits', { count: p.includedAiCredits }),
                ];
                return (
                  <button
                    key={p.name}
                    type="button"
                    disabled={!eligible}
                    onClick={() => setSelectedPlan(p.name)}
                    className={`text-left rounded-xl border-2 p-5 transition-colors ${
                      selected ? 'border-brand-600 bg-brand-50' : eligible ? 'border-gray-200 hover:border-brand-300' : 'border-gray-100 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold text-gray-900">{p.name}</span>
                      {selected && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
                    </div>
                    {p.baseFeeHuf !== null && p.perSeatFeeHuf !== null && (
                      <p className="text-sm text-gray-700 mb-1">
                        {t('onboardingWizard.plan.price', {
                          base: fmt(annualizedIfNeeded(p.baseFeeHuf, interval)),
                          seat: fmt(annualizedIfNeeded(p.perSeatFeeHuf, interval)),
                          per: perLabel,
                        })}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mb-3">
                      {p.maxEmployees !== null
                        ? t('onboardingWizard.plan.rangeMax', { count: p.maxEmployees })
                        : p.minEmployees !== null
                        ? t('onboardingWizard.plan.rangeMin', { count: p.minEmployees })
                        : ''}
                    </p>
                    <ul className="space-y-1">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{f}
                        </li>
                      ))}
                    </ul>
                    {!eligible && (
                      <p className="text-xs text-red-600 mt-3">{t('onboardingWizard.plan.notEligible', { count: employeeCount })}</p>
                    )}
                  </button>
                );
              })}
            </div>

            {assistedAvailable && (
              <label className="flex items-start gap-3 border border-gray-200 rounded-xl p-4 mb-6 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={assisted}
                  onChange={(e) => setAssisted(e.target.checked)}
                  className="mt-1 h-4 w-4 text-brand-600 border-gray-300 rounded"
                />
                <span className="text-sm">
                  <span className="font-medium text-gray-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {t('onboardingWizard.plan.assistedTitle', { fee: fmt(ASSISTED_ONBOARDING_FEE_HUF) })}
                  </span>
                  <span className="text-gray-500 block mt-0.5">{t('onboardingWizard.plan.assistedBody')}</span>
                </span>
              </label>
            )}

            {plan && recurringTotal !== null && firstPayment !== null && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm mb-2">
                <div className="flex justify-between text-gray-600 mb-1">
                  <span>{t('onboardingWizard.plan.summaryRecurring', { plan: plan.name, count: seats })}</span>
                  <span>{fmt(recurringTotal)} {perLabel}</span>
                </div>
                {assisted && assistedAvailable && (
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>{t('onboardingWizard.plan.summaryAssisted')}</span>
                    <span>{fmt(ASSISTED_ONBOARDING_FEE_HUF)} HUF</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                  <span>{t('onboardingWizard.plan.summaryToday')}</span>
                  <span>{fmt(firstPayment)} HUF</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{t('onboardingWizard.plan.summaryNote')}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-8">
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> {t('onboardingWizard.back')}
              </button>
              <button
                onClick={startCheckout}
                disabled={!plan || redirecting}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
              >
                {redirecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {t('onboardingWizard.plan.pay')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
