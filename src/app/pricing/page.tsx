'use client';

import Link from 'next/link';
import { Check, X, Info } from 'lucide-react';
import { useLocale } from 'i18n/LocaleProvider';

type PlanKey = 'free' | 'momentum' | 'infinity';

const PLAN_LIMITS: Record<PlanKey, { positions: number; certificates: number; credits: number; wellbeing: boolean }> = {
  free: { positions: 3, certificates: 5, credits: 50, wellbeing: false },
  momentum: { positions: 5, certificates: 10, credits: 100, wellbeing: true },
  infinity: { positions: 10, certificates: 20, credits: 250, wellbeing: true },
};

export default function PricingPage() {
  const { t } = useLocale();

  const plans: PlanKey[] = ['free', 'momentum', 'infinity'];

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
            const limits = PLAN_LIMITS[plan];
            const isMomentum = plan === 'momentum';

            return (
              <div
                key={plan}
                className={`relative bg-white rounded-2xl shadow-lg p-8 flex flex-col ${
                  isMomentum ? 'ring-2 ring-brand-600 shadow-xl md:-translate-y-2' : ''
                }`}
              >
                {isMomentum && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {t('pricing.momentum.badge')}
                  </div>
                )}

                <h2 className="font-heading text-xl font-bold text-gray-800 mb-1">
                  {t(`pricing.${plan}.name`)}
                </h2>
                <p className="text-sm text-gray-500 mb-4">{t(`pricing.${plan}.tagline`)}</p>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">{t(`pricing.${plan}.price`)}</span>
                  {plan !== 'free' && <span className="text-gray-500">{t('pricing.perMonth')}</span>}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    {t('pricing.features.positions', { count: limits.positions })}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    {t('pricing.features.certificates', { count: limits.certificates })}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    {t('pricing.features.credits', { count: limits.credits })}
                  </li>
                  <li className={`flex items-start gap-2 text-sm ${limits.wellbeing ? 'text-gray-700' : 'text-gray-400'}`}>
                    {limits.wellbeing ? (
                      <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    {limits.wellbeing ? t('pricing.features.wellbeingIncluded') : t('pricing.features.wellbeingNotIncluded')}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 pt-2 border-t border-gray-100">
                    <Check className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    {t('pricing.features.fullPlatform')}
                  </li>
                </ul>

                <Link
                  href="/job-assistant"
                  className={`block text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                    isMomentum
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
