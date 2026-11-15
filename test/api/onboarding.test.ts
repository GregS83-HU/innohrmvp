import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, mockEmptyCookies, writesTo } from '../helpers/supabaseMock';
import { personaAuth, personaTables, jsonRequest, COMPANY_A } from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/onboarding/route';

let client: ReturnType<typeof createSupabaseMock>;

async function loadRoute() {
  vi.resetModules();
  const base = personaTables();
  client = createSupabaseMock({
    auth: personaAuth,
    tables: {
      ...base,
      company_to_users: (s) => (s.head ? { count: 12 } : base.company_to_users(s)),
      company: (s) =>
        s.method === 'select'
          ? {
              data: {
                id: COMPANY_A, company_name: 'Acme', slug: 'acme', forfait: null, onboarding_completed: false,
                stripe_subscription_id: null, billing_interval: null, assisted_onboarding_requested: false, onboarding_fee_paid_at: null,
              },
            }
          : {},
      forfait: () => ({
        data: [
          { forfait_name: 'Growth', base_fee_huf: 40000, per_seat_fee_huf: 750, min_employees: 31, max_employees: null, access_performance: true, access_happy_check: true, access_advanced_reporting: true, included_ai_credits: 250, max_opened_position: 10, stripe_price_id_onboarding: 'onb' },
          { forfait_name: 'Core', base_fee_huf: 25000, per_seat_fee_huf: 1000, min_employees: null, max_employees: 30, access_performance: false, access_happy_check: false, access_advanced_reporting: false, included_ai_credits: 100, max_opened_position: 5, stripe_price_id_onboarding: 'onb' },
        ],
      }),
    },
  });
  mockSupabaseJs(client);
  mockEmptyCookies();
  return import(ROUTE_PATH);
}

const url = 'http://localhost/api/onboarding';

describe('GET /api/onboarding', () => {
  beforeEach(() => vi.resetModules());

  it('rejects anonymous callers', async () => {
    const { GET } = await loadRoute();
    expect((await GET(jsonRequest(url, 'GET'))).status).toBe(401);
  });

  it('rejects non-admin employees', async () => {
    const { GET } = await loadRoute();
    expect((await GET(jsonRequest(url, 'GET', undefined, 'employee'))).status).toBe(403);
  });

  it("returns the admin's own company state and the paid plans in Core, Growth order", async () => {
    const { GET } = await loadRoute();
    const res = await GET(jsonRequest(url, 'GET', undefined, 'admin'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.company).toMatchObject({ name: 'Acme', onboardingCompleted: false, hasSubscription: false, employeeCount: 12 });
    expect(body.plans.map((p: { name: string }) => p.name)).toEqual(['Core', 'Growth']);
    expect(body.plans[0]).toMatchObject({ baseFeeHuf: 25000, perSeatFeeHuf: 1000, maxEmployees: 30, assistedOnboardingAvailable: true });
    for (const c of client.calls.filter((c) => c.table === 'company')) expect(c.filters['id']).toBe(COMPANY_A);
  });
});

describe('PATCH /api/onboarding', () => {
  beforeEach(() => vi.resetModules());

  it("updates only the caller's own company name", async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(jsonRequest(url, 'PATCH', { company_name: '  Acme Kft.  ', company_id: 999 }, 'admin'));
    expect(res.status).toBe(200);
    const [update] = writesTo(client, 'company').filter((w) => w.method === 'update');
    expect(update.payload).toEqual({ company_name: 'Acme Kft.' });
    expect(update.filters['id']).toBe(COMPANY_A);
  });

  it('rejects an empty name', async () => {
    const { PATCH } = await loadRoute();
    expect((await PATCH(jsonRequest(url, 'PATCH', { company_name: '   ' }, 'admin'))).status).toBe(400);
  });

  it('rejects non-admins', async () => {
    const { PATCH } = await loadRoute();
    expect((await PATCH(jsonRequest(url, 'PATCH', { company_name: 'X' }, 'employee'))).status).toBe(403);
  });
});
