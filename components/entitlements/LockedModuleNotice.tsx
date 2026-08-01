'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import type { FeatureKey } from '../../src/config/entitlements';
import { FEATURE_COPY } from '../../src/config/entitlements';

type Props = {
  feature: Extract<FeatureKey, 'payroll.use' | 'attendance.use' | 'absences.use' | 'performance.use'>;
  plan: string | null;
  upgradeHref: string;
};

/**
 * Shown to company admins/HR managers when a module (payroll, attendance,
 * absences, performance) isn't included in the company's current plan.
 * Admins still see the module in navigation and can open it - this is
 * what they see instead of the real feature UI. Non-admins never reach
 * this: the nav hides the module entirely for them. See
 * MODULE_GATING_FIX.md.
 */
export default function LockedModuleNotice({ feature, plan, upgradeHref }: Props) {
  const copy = FEATURE_COPY[feature];

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-gray-500" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">{copy.title}</h1>
      <p className="text-gray-600 mb-1">{copy.notIncluded}</p>
      {plan && <p className="text-sm text-gray-400 mb-6">Current plan: {plan}</p>}
      <Link
        href={upgradeHref}
        className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        View plans
      </Link>
    </div>
  );
}
