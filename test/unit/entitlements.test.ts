import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs } from '../helpers/supabaseMock';
import type { FeatureKey } from '../../src/config/entitlements';

// Plan rows shaped like the live `forfait` table (see the 20260913* pricing
// migrations). Numeric limits are test fixtures - the logic under test is the
// gating decision, not the specific numbers, which live in the DB.
const PLANS: Record<string, Record<string, unknown>> = {
  Free: { forfait_name: 'Free', max_opened_position: 2, max_medical_certificates: 5, access_happy_check: false, access_attendance_absences: false, access_performance: false, access_support_tickets: false, access_advanced_reporting: false, max_employees: null },
  Core: { forfait_name: 'Core', max_opened_position: 5, max_medical_certificates: 10, access_happy_check: false, access_attendance_absences: true, access_performance: false, access_support_tickets: true, access_advanced_reporting: false, max_employees: 30 },
  Growth: { forfait_name: 'Growth', max_opened_position: 15, max_medical_certificates: 20, access_happy_check: true, access_attendance_absences: true, access_performance: true, access_support_tickets: true, access_advanced_reporting: true, max_employees: null },
};

async function load(company: { forfait: string | null; onboarding_completed: boolean } | null, counts: Partial<Record<string, number>> = {}, plans = PLANS) {
  vi.resetModules();
  const client = createSupabaseMock({
    tables: {
      company: () => (company ? { data: company } : { data: null, error: new Error('nope') }),
      forfait: (s) => ({ data: plans[s.filters['forfait_name'] as string] ?? null, error: plans[s.filters['forfait_name'] as string] ? null : new Error('missing') }),
      openedpositions: () => ({ count: counts.openedpositions ?? 0 }),
      medical_certificates: () => ({ count: counts.medical_certificates ?? 0 }),
      company_to_users: (s) => (s.head ? { count: counts.company_to_users ?? 0 } : { data: { company_id: 42 } }),
    },
  });
  mockSupabaseJs(client);
  return { mod: await import('../../lib/entitlements'), client };
}

const onboarded = (forfait: string | null) => ({ forfait, onboarding_completed: true });

describe('hasFeatureAccess - plan matrix (onboarded company)', () => {
  beforeEach(() => vi.resetModules());

  // [feature, Free, Core, Growth]
  const flagMatrix: [FeatureKey, boolean, boolean, boolean][] = [
    ['attendance.use', false, true, true],
    ['absences.use', false, true, true],
    ['performance.use', false, false, true],
    ['happiness.chatbot', false, false, true],
    ['support.tickets', false, true, true],
    ['reporting.advanced', false, false, true],
  ];

  for (const [feature, free, core, growth] of flagMatrix) {
    it(`${feature}: Free=${free} Core=${core} Growth=${growth}`, async () => {
      for (const [plan, expected] of [['Free', free], ['Core', core], ['Growth', growth]] as const) {
        const { mod } = await load(onboarded(plan));
        const res = await mod.hasFeatureAccess(1, feature);
        expect(res.allowed, `${feature} on ${plan}`).toBe(expected);
        if (!res.allowed) expect(res.reason).toBe('not_included_in_plan');
      }
    });
  }
});

describe('hasFeatureAccess - capacity limits', () => {
  beforeEach(() => vi.resetModules());

  it('allows opening a position below the plan cap and blocks at the cap', async () => {
    let { mod } = await load(onboarded('Free'), { openedpositions: 1 });
    expect((await mod.hasFeatureAccess(1, 'recruitment.openPosition')).allowed).toBe(true);
    ({ mod } = await load(onboarded('Free'), { openedpositions: 2 }));
    const res = await mod.hasFeatureAccess(1, 'recruitment.openPosition');
    expect(res).toEqual({ allowed: false, reason: 'plan_limit_reached', plan: 'Free' });
  });

  it('only counts positions that are still open (end date null or in the future)', async () => {
    const { mod, client } = await load(onboarded('Core'), { openedpositions: 0 });
    await mod.hasFeatureAccess(1, 'recruitment.openPosition');
    const q = client.calls.find((c) => c.table === 'openedpositions');
    expect(q?.orFilter).toMatch(/^position_end_date\.is\.null,position_end_date\.gt\./);
    expect(q?.filters['company_id']).toBe(1);
  });

  it('caps medical certificate uploads per calendar month', async () => {
    const { mod, client } = await load(onboarded('Core'), { medical_certificates: 10 });
    const res = await mod.hasFeatureAccess(1, 'medicalCertificates.upload');
    expect(res.allowed).toBe(false);
    const q = client.calls.find((c) => c.table === 'medical_certificates');
    const window = q?.filters['created_at'] as { gte: string; lt: string };
    expect(new Date(window.gte).getUTCDate()).toBe(1);
    expect(new Date(window.lt).getUTCDate()).toBe(1);
  });

  it('caps Core at 30 active employees', async () => {
    let { mod } = await load(onboarded('Core'), { company_to_users: 29 });
    expect((await mod.hasFeatureAccess(1, 'company.addEmployee')).allowed).toBe(true);
    ({ mod } = await load(onboarded('Core'), { company_to_users: 30 }));
    expect((await mod.hasFeatureAccess(1, 'company.addEmployee')).allowed).toBe(false);
  });

  it('treats a null employee cap (Free, Growth) as unlimited rather than failing closed', async () => {
    for (const plan of ['Free', 'Growth']) {
      const { mod } = await load(onboarded(plan), { company_to_users: 5000 });
      expect((await mod.hasFeatureAccess(1, 'company.addEmployee')).allowed).toBe(true);
    }
  });
});

describe('hasFeatureAccess - onboarding gate', () => {
  beforeEach(() => vi.resetModules());

  const gated: FeatureKey[] = ['attendance.use', 'absences.use', 'performance.use', 'happiness.chatbot', 'medicalCertificates.upload'];
  const notGated: FeatureKey[] = ['recruitment.openPosition', 'support.tickets', 'reporting.advanced'];

  it('blocks onboarding-gated modules even on Growth until onboarding is complete', async () => {
    for (const f of gated) {
      const { mod } = await load({ forfait: 'Growth', onboarding_completed: false });
      expect(await mod.hasFeatureAccess(1, f)).toEqual({ allowed: false, reason: 'onboarding_required', plan: 'Growth' });
    }
  });

  it('does not apply the onboarding gate to recruitment, tickets or reporting', async () => {
    for (const f of notGated) {
      const { mod } = await load({ forfait: 'Growth', onboarding_completed: false });
      expect((await mod.hasFeatureAccess(1, f)).allowed, f).toBe(true);
    }
  });
});

describe('hasFeatureAccess - fallbacks and failure modes', () => {
  beforeEach(() => vi.resetModules());

  it('treats a company with no plan exactly like Free', async () => {
    const { mod } = await load(onboarded(null), { openedpositions: 1 });
    expect(await mod.hasFeatureAccess(1, 'recruitment.openPosition')).toEqual({ allowed: true, plan: 'Free' });
    expect((await mod.hasFeatureAccess(1, 'attendance.use')).allowed).toBe(false);
  });

  it('fails closed when the company does not exist', async () => {
    const { mod } = await load(null);
    expect(await mod.hasFeatureAccess(1, 'recruitment.openPosition')).toEqual({ allowed: false, reason: 'no_subscription', plan: null });
  });

  it('fails closed on an unknown plan name (data drift)', async () => {
    const { mod } = await load(onboarded('Momentum'));
    const res = await mod.hasFeatureAccess(1, 'attendance.use');
    expect(res).toMatchObject({ allowed: false, reason: 'unknown_plan' });
  });

  it('fails closed when a position/certificate cap is null (misconfigured plan)', async () => {
    const { mod } = await load(onboarded('Free'), {}, { Free: { ...PLANS.Free, max_opened_position: null } });
    expect(await mod.hasFeatureAccess(1, 'recruitment.openPosition')).toMatchObject({ allowed: false, reason: 'unknown_plan' });
  });
});

describe('entitlementErrorBody', () => {
  it('returns the onboarding message for onboarding_required', async () => {
    const { mod } = await load(onboarded('Free'));
    const body = mod.entitlementErrorBody('attendance.use', { allowed: false, reason: 'onboarding_required', plan: 'Core' });
    expect(body).toMatchObject({ code: 'UPGRADE_REQUIRED', reason: 'onboarding_required', message: 'Available after your onboarding call.' });
  });

  it('returns the Core 30-employee upgrade message when the seat cap is hit', async () => {
    const { mod } = await load(onboarded('Free'));
    const body = mod.entitlementErrorBody('company.addEmployee', { allowed: false, reason: 'plan_limit_reached', plan: 'Core' });
    expect(body.message).toMatch(/30-employee limit.*Growth/);
  });
});
