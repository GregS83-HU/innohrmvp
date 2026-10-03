import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, mockEmptyCookies } from '../../helpers/supabaseMock';
import { personaAuth, personaTables, jsonRequest, COMPANY_A, COMPANY_B, type PersonaName } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/stripe/create-subscription/route';

const FORFAITS = {
  Core: { stripe_price_id_base_monthly: 'core_base_m', stripe_price_id_seat_monthly: 'core_seat_m', stripe_price_id_base_annual: 'core_base_y', stripe_price_id_seat_annual: 'core_seat_y', stripe_price_id_onboarding: 'onb', min_employees: null, max_employees: 30 },
  Growth: { stripe_price_id_base_monthly: 'gr_base_m', stripe_price_id_seat_monthly: 'gr_seat_m', stripe_price_id_base_annual: 'gr_base_y', stripe_price_id_seat_annual: 'gr_seat_y', stripe_price_id_onboarding: 'onb', min_employees: 31, max_employees: null },
};

let checkoutCreate: ReturnType<typeof vi.fn>;
let customerCreate: ReturnType<typeof vi.fn>;
let client: ReturnType<typeof createSupabaseMock>;

async function loadRoute(opts: { employees?: number; company?: Record<string, unknown> } = {}) {
  vi.resetModules();
  checkoutCreate = vi.fn(async () => ({ id: 'cs_123' }));
  customerCreate = vi.fn(async () => ({ id: 'cus_new' }));
  vi.doMock('../../../lib/stripe/client', () => ({
    stripe: { customers: { create: customerCreate }, checkout: { sessions: { create: checkoutCreate } } },
  }));
  const base = personaTables();
  client = createSupabaseMock({
    auth: personaAuth,
    tables: {
      ...base,
      company_to_users: (s) => (s.head ? { count: opts.employees ?? 10 } : base.company_to_users(s)),
      company: (s) =>
        s.method === 'select'
          ? { data: { stripe_customer_id: 'cus_abc', stripe_subscription_id: null, onboarding_fee_paid_at: null, ...opts.company } }
          : { data: null },
      forfait: (s) => ({ data: FORFAITS[s.filters['forfait_name'] as keyof typeof FORFAITS] ?? null }),
    },
  });
  mockSupabaseJs(client);
  mockEmptyCookies();
  return import(ROUTE_PATH);
}

const req = (persona?: PersonaName, body: Record<string, unknown> = {}) =>
  jsonRequest('http://localhost/api/stripe/create-subscription', 'POST', { tier: 'Core', interval: 'month', return_url: 'https://app.test/sub', company_id: COMPANY_B, ...body }, persona);

describe('POST /api/stripe/create-subscription', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present', async () => {
    const { POST } = await loadRoute();
    expect((await POST(req())).status).toBe(401);
    expect(checkoutCreate).not.toHaveBeenCalled();
  });

  it('rejects with 403 when the caller is a non-admin employee', async () => {
    const { POST } = await loadRoute();
    expect((await POST(req('employee'))).status).toBe(403);
    expect(checkoutCreate).not.toHaveBeenCalled();
  });

  it('rejects an unknown tier or interval with 400', async () => {
    const { POST } = await loadRoute();
    expect((await POST(req('admin', { tier: 'Enterprise' }))).status).toBe(400);
    expect((await POST(req('admin', { interval: 'week' }))).status).toBe(400);
  });

  it("ignores an attacker-supplied company_id and only ever acts on the caller's own company", async () => {
    const { POST } = await loadRoute();
    await POST(req('admin'));
    const companyReads = client.calls.filter((c) => c.table === 'company');
    expect(companyReads.length).toBeGreaterThan(0);
    for (const c of companyReads) expect(c.filters['id']).toBe(COMPANY_A);
  });

  it('creates a monthly Core checkout with base + seat items and the one-time onboarding fee', async () => {
    const { POST } = await loadRoute({ employees: 12 });
    const res = await POST(req('admin'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sessionId: 'cs_123' });
    const args = checkoutCreate.mock.calls[0][0];
    expect(args.customer).toBe('cus_abc');
    expect(args.allow_promotion_codes).toBe(false);
    expect(args.line_items).toEqual([
      { price: 'core_base_m', quantity: 1 },
      { price: 'core_seat_m', quantity: 12 },
      { price: 'onb', quantity: 1 },
    ]);
  });

  it('uses annual prices when interval=year', async () => {
    const { POST } = await loadRoute({ employees: 40 });
    await POST(req('admin', { tier: 'Growth', interval: 'year' }));
    const items = checkoutCreate.mock.calls[0][0].line_items.map((i: { price: string }) => i.price);
    expect(items).toEqual(['gr_base_y', 'gr_seat_y', 'onb']);
  });

  it('never charges the onboarding fee twice', async () => {
    const { POST } = await loadRoute({ company: { onboarding_fee_paid_at: '2026-01-01' } });
    await POST(req('admin'));
    const items = checkoutCreate.mock.calls[0][0].line_items.map((i: { price: string }) => i.price);
    expect(items).not.toContain('onb');
  });

  it('refuses Core above 30 employees (pricing crossover guard)', async () => {
    const { POST } = await loadRoute({ employees: 31 });
    const res = await POST(req('admin'));
    expect(res.status).toBe(409);
    expect(checkoutCreate).not.toHaveBeenCalled();
  });

  it('refuses Growth below 31 employees', async () => {
    const { POST } = await loadRoute({ employees: 30 });
    const res = await POST(req('admin', { tier: 'Growth' }));
    expect(res.status).toBe(409);
    expect(checkoutCreate).not.toHaveBeenCalled();
  });

  it('refuses to create a second subscription for an already-subscribed company', async () => {
    const { POST } = await loadRoute({ company: { stripe_subscription_id: 'sub_live' } });
    const res = await POST(req('admin'));
    expect(res.status).toBe(409);
    expect(checkoutCreate).not.toHaveBeenCalled();
  });

  it('creates a Stripe customer on first checkout and stores it on the company', async () => {
    const { POST } = await loadRoute({ company: { stripe_customer_id: null } });
    await POST(req('admin'));
    expect(customerCreate).toHaveBeenCalled();
    const update = client.calls.find((c) => c.table === 'company' && c.method === 'update');
    expect(update?.payload).toEqual({ stripe_customer_id: 'cus_new' });
    expect(update?.filters['id']).toBe(COMPANY_A);
  });
});
