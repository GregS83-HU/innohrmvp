'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Check, X, Lock, Info } from 'lucide-react';
import { useLocale } from 'i18n/LocaleProvider';
import { trackFunnelEvent } from '../../../lib/funnelTracking';

type PlanKey = 'free' | 'core' | 'growth';

// Core and Growth are priced as a flat base fee plus a per-employee fee that
// scales with headcount. Unlike the original per-seat design, headcount is
// NOT uncapped: Core's formula would cross over to cost more than Growth's
// past a certain headcount despite Growth including strictly more features,
// so Core is hard-capped at 30 employees and Growth requires at least 31 to
// subscribe - enforced in src/app/api/stripe/create-subscription/route.ts
// and (for Core's cap specifically) every employee-add path, not just shown
// here as a label. hrOps/performance drive which icon+copy each plan shows
// for those two capability gates: "locked" (Free - preview only, not
// usable), "included" (usable), or "notIncluded" (Core's missing
// performance management - a real working plan that just doesn't have that
// one module).
const PLAN_DATA: Record<
  PlanKey,
  {
    positions: number;
    certificates: number;
    credits: number;
    baseFeeHuf: number | null;
    perSeatFeeHuf: number | null;
    minEmployees: number | null;
    maxEmployees: number | null;
    wellbeing: boolean;
    hrOps: 'locked' | 'included';
    performance: 'locked' | 'notIncluded' | 'included';
    advancedReporting: boolean;
  }
> = {
  free: { positions: 2, certificates: 5, credits: 50, baseFeeHuf: null, perSeatFeeHuf: null, minEmployees: null, maxEmployees: null, wellbeing: false, hrOps: 'locked', performance: 'locked', advancedReporting: false },
  core: { positions: 5, certificates: 10, credits: 100, baseFeeHuf: 25000, perSeatFeeHuf: 1000, minEmployees: null, maxEmployees: 30, wellbeing: false, hrOps: 'included', performance: 'notIncluded', advancedReporting: false },
  growth: { positions: 10, certificates: 20, credits: 250, baseFeeHuf: 40000, perSeatFeeHuf: 750, minEmployees: 31, maxEmployees: null, wellbeing: true, hrOps: 'included', performance: 'included', advancedReporting: true },
};

const ONBOARDING_FEE_HUF = 60000;

export default function PricingPage() {
  const { t } = useLocale();

  const plans: PlanKey[] = ['free', 'core', 'growth'];

  useEffect(() => {
    trackFunnelEvent('pricing_viewed', { source: 'pricing_page' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-indigo-100 px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            {t('pricing.eyebrow')}
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const data = PLAN_DATA[plan];
            const isCore = plan === 'core';

            return (
              <div
                key={plan}
                className={`relative bg-white rounded-2xl shadow-lg p-8 flex flex-col ${
                  isCore ? 'ring-2 ring-brand-600 shadow-xl md:-translate-y-2' : ''
                }`}
              >
                {isCore && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {t('pricing.core.badge')}
                  </div>
                )}

                <h2 className="font-heading text-xl font-bold text-gray-800 mb-1">
                  {t(`pricing.${plan}.name`)}
                </h2>
                <p className="text-sm text-gray-500 mb-4">{t(`pricing.${plan}.tagline`)}</p>

                <div className="mb-1">
                  {data.baseFeeHuf === null ? (
                    <span className="text-3xl font-bold text-gray-900">{t('pricing.free.price')}</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900">{data.baseFeeHuf.toLocaleString()}</span>
                      <span className="text-gray-500"> {t('pricing.perMonth')}</span>
                    </>
                  )}
                </div>
                {data.perSeatFeeHuf !== null && (
                  <p className="text-sm text-gray-500 mb-1">
                    {t('pricing.perEmployee', { price: data.perSeatFeeHuf.toLocaleString() })}
                  </p>
                )}
                {data.maxEmployees !== null && (
                  <p className="text-xs text-gray-400 mb-6">{t('pricing.employeeRangeMax', { count: data.maxEmployees })}</p>
                )}
                {data.minEmployees !== null && (
                  <p className="text-xs text-gray-400 mb-6">{t('pricing.employeeRangeMin', { count: data.minEmployees })}</p>
                )}
                {data.perSeatFeeHuf === null && <div className="mb-6" />}

                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    {t('pricing.features.positions', { count: data.positions })}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    {t('pricing.features.certificates', { count: data.certificates })}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    {t('pricing.features.credits', { count: data.credits })}
                  </li>

                  {/* Time & attendance / absences */}
                  <li className={`flex items-start gap-2 text-sm pt-2 border-t border-gray-100 ${data.hrOps === 'included' ? 'text-gray-700' : 'text-gray-400'}`}>
                    {data.hrOps === 'included' ? (
                      <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    {data.hrOps === 'included' ? t('pricing.features.hrOpsIncluded') : t('pricing.features.hrOpsLocked')}
                  </li>

                  {/* Performance management */}
                  <li className={`flex items-start gap-2 text-sm ${data.performance === 'included' ? 'text-gray-700' : 'text-gray-400'}`}>
                    {data.performance === 'included' ? (
                      <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    ) : data.performance === 'locked' ? (
                      <Lock className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    {data.performance === 'included'
                      ? t('pricing.features.performanceIncluded')
                      : data.performance === 'locked'
                      ? t('pricing.features.performanceLocked')
                      : t('pricing.features.performanceNotIncluded')}
                  </li>

                  {/* AI wellbeing chatbot */}
                  <li className={`flex items-start gap-2 text-sm ${data.wellbeing ? 'text-gray-700' : 'text-gray-400'}`}>
                    {data.wellbeing ? (
                      <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    {data.wellbeing ? t('pricing.features.wellbeingIncluded') : t('pricing.features.wellbeingNotIncluded')}
                  </li>

                  {/* Advanced reporting */}
                  <li className={`flex items-start gap-2 text-sm ${data.advancedReporting ? 'text-gray-700' : 'text-gray-400'}`}>
                    {data.advancedReporting ? (
                      <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    {data.advancedReporting ? t('pricing.features.advancedReportingIncluded') : t('pricing.features.advancedReportingNotIncluded')}
                  </li>
                </ul>

                <Link
                  href="/signup"
                  onClick={() => trackFunnelEvent('pricing_cta_clicked', { source: 'pricing_page', plan })}
                  className={`block text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                    isCore
                      ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white hover:opacity-90 shadow-md'
                      : 'border-2 border-brand-600 text-brand-700 hover:bg-brand-50'
                  }`}
                >
                  {t(`pricing.${plan}.cta`)}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Onboarding fee + annual discount note */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-5 flex items-start gap-3 mb-3">
          <Info className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            {t('pricing.onboardingFeeNote', { fee: ONBOARDING_FEE_HUF.toLocaleString() })}
          </p>
        </div>

        {/* Onboarding-completion note */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-5 flex items-start gap-3 mb-3">
          <Info className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">{t('pricing.onboardingNote')}</p>
        </div>

        {/* Data retention note */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-5 flex items-start gap-3 mb-3">
          <Info className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">{t('pricing.dataNote')}</p>
        </div>

        <p className="text-center text-xs text-gray-400">{t('pricing.priceNote')}</p>
      </div>
    </div>
  );
}
