import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, mockEmptyCookies } from '../../helpers/supabaseMock';
import { personaAuth, personaTables, jsonRequest, COMPANY_A, COMPANY_B, type PersonaName } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/stripe/subscription/route';

let client: ReturnType<typeof createSupabaseMock>;

async function loadRoute(company: Record<string, unknown> = { forfait: 'Core', stripe_subscription_id: 'sub_1', billing_interval: 'month', onboarding_fee_paid_at: '2026-01-01' }) {
  vi.resetModules();
  const base = personaTables();
  client = createSupabaseMock({
    auth: personaAuth,
    tables: {
      ...base,
      company_to_users: (s) => (s.head ? { count: 7 } : base.company_to_users(s)),
      company: () => ({ data: company }),
    },
  });
  mockSupabaseJs(client);
  mockEmptyCookies();
  return import(ROUTE_PATH);
}

const req = (persona?: PersonaName) =>
  jsonRequest(`http://localhost/api/stripe/subscription?company_id=${COMPANY_B}`, 'GET', undefined, persona);

describe('GET /api/stripe/subscription', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present', async () => {
    const { GET } = await loadRoute();
    expect((await GET(req())).status).toBe(401);
  });

  it("ignores an attacker-supplied company_id query param and only ever reads the caller's own company", async () => {
    const { GET } = await loadRoute();
    await GET(req('employee'));
    for (const c of client.calls.filter((c) => c.table === 'company')) expect(c.filters['id']).toBe(COMPANY_A);
  });

  it('returns plan, status, interval and active headcount to any company member', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('employee'));
    expect(res.status).toBe(200);
    expect((await res.json()).subscription).toEqual({
      plan: 'Core',
      status: 'Active',
      billingInterval: 'month',
      hasStripeSubscription: true,
      onboardingFeePaid: true,
      employeeCount: 7,
    });
  });

  it('reports a company with no plan as plan "None" / Inactive (Free fallback)', async () => {
    const { GET } = await loadRoute({ forfait: null, stripe_subscription_id: null });
    const body = await (await GET(req('admin'))).json();
    expect(body.subscription.plan).toBe('None');
    expect(body.subscription.status).toBe('Inactive');
  });

  it('reports a plan without a Stripe subscription as Pending', async () => {
    const { GET } = await loadRoute({ forfait: 'Growth', stripe_subscription_id: null });
    const body = await (await GET(req('admin'))).json();
    expect(body.subscription.status).toBe('Pending');
  });
});
