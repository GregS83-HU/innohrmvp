'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import type { FeatureKey } from '../../src/config/entitlements';
import { FEATURE_COPY, getOnboardingRequiredMessage } from '../../src/config/entitlements';

type Props = {
  feature: Extract<FeatureKey, 'attendance.use' | 'absences.use' | 'performance.use' | 'medicalCertificates.upload' | 'support.tickets' | 'reporting.advanced'>;
  plan: string | null;
  upgradeHref: string;
  /**
   * 'plan' (default): the module isn't included in the company's current
   * plan - CTA points to plans/upgrade. 'onboarding': the company hasn't
   * finished self-onboarding yet (setup wizard + first payment) - CTA
   * points to the setup wizard.
   */
  reason?: 'plan' | 'onboarding';
};

/**
 * Shown to company admins/HR managers when a module (attendance, absences,
 * performance, medical certificates, support tickets) isn't accessible yet -
 * either because it isn't included in the plan, or because the company
 * hasn't finished self-onboarding yet (see ONBOARDING_GATED_FEATURES).
 * Admins still see the module in navigation and can open it - this is what
 * they see instead of the real feature UI. Non-admins never reach this: the
 * nav hides the module entirely for them. See MODULE_GATING_FIX.md.
 */
export default function LockedModuleNotice({ feature, plan, upgradeHref, reason = 'plan' }: Props) {
  const copy = FEATURE_COPY[feature];
  const isOnboarding = reason === 'onboarding';

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-slate-500" />
      </div>
      <h1 className="text-xl font-semibold text-slate-900 mb-2">{copy.title}</h1>
      <p className="text-slate-600 mb-1">
        {isOnboarding ? getOnboardingRequiredMessage(feature) : copy.notIncluded}
      </p>
      {!isOnboarding && plan && <p className="text-sm text-slate-400 mb-6">Current plan: {plan}</p>}
      <Link
        href={upgradeHref}
        className={`inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-medium transition-colors ${isOnboarding ? 'mt-2' : ''}`}
      >
        {isOnboarding ? 'Finish setup' : 'View plans'}
      </Link>
    </div>
  );
}
