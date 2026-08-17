'use client';

import { useEffect, useState } from 'react';

export type ModuleAccessState = {
  loading: boolean;
  isAdmin: boolean;
  plan: string | null;
  payrollAttendanceAbsencesEnabled: boolean;
  performanceEnabled: boolean;
  onboardingCompleted: boolean;
};

const DEFAULT_STATE: ModuleAccessState = {
  loading: true,
  isAdmin: false,
  plan: null,
  payrollAttendanceAbsencesEnabled: false,
  performanceEnabled: false,
  onboardingCompleted: false,
};

/**
 * Client-side read of plan-based access to payroll/attendance/absences
 * (one flag, shared) and performance management, plus whether the current
 * user is a company admin. Used to decide locked-preview (admin) vs
 * hidden (everyone else) in nav and page-level gating. Not itself an
 * enforcement point - see lib/entitlements.ts / MODULE_GATING_FIX.md for
 * the real server-side checks.
 */
export function useModuleAccess(userId: string | null | undefined): ModuleAccessState {
  const [state, setState] = useState<ModuleAccessState>(DEFAULT_STATE);

  useEffect(() => {
    if (!userId) {
      setState({ ...DEFAULT_STATE, loading: false });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    fetch(`/api/entitlements/status?userId=${encodeURIComponent(userId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setState({ ...DEFAULT_STATE, loading: false });
          return;
        }
        setState({
          loading: false,
          isAdmin: !!data.isAdmin,
          plan: data.plan ?? null,
          payrollAttendanceAbsencesEnabled: !!data.payrollAttendanceAbsencesEnabled,
          performanceEnabled: !!data.performanceEnabled,
          onboardingCompleted: !!data.onboardingCompleted,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ ...DEFAULT_STATE, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return state;
}
