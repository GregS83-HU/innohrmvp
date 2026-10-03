import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, mockEmptyCookies, writesTo } from '../../helpers/supabaseMock';
import { personaAuth, personaTables, jsonRequest, type PersonaName } from '../../helpers/authFixtures';

const BILLING_PATH = '../../../src/app/api/admin/billing/route';
const DISCOUNT_PATH = '../../../src/app/api/admin/billing/founding-discount/route';

let client: ReturnType<typeof createSupabaseMock>;
let subscriptionsUpdate: ReturnType<typeof vi.fn>;

async function load(path: string, company: Record<string, unknown> = {}) {
  vi.resetModules();
  subscriptionsUpdate = vi.fn(async () => ({}));
  vi.doMock('../../../lib/stripe/client', () => ({ stripe: { subscriptions: { update: subscriptionsUpdate } } }));
  const base = personaTables();
  client = createSupabaseMock({
    auth: personaAuth,
    tables: {
      ...base,
      company_to_users: (s) => (s.head ? { count: s.filters['company_id'] === 1 ? 12 : 40 } : base.company_to_users(s)),
      company: (s) => {
        if (s.terminal === 'then') return { data: [{ id: 1, company_name: 'A' }, { id: 2, company_name: 'B' }] };
        if (s.method === 'update') return { data: { id: 1, founding_discount_coupon_id: (s.payload as Record<string, unknown>).founding_discount_coupon_id } };
        return { data: { id: 1, stripe_subscription_id: 'sub_1', stripe_base_item_id: 'si_base', founding_discount_applied_at: null, ...company } };
      },
    },
  });
  mockSupabaseJs(client);
  mockEmptyCookies();
  return import(path);
}

const get = (persona?: PersonaName) => jsonRequest('http://localhost/api/admin/billing', 'GET', undefined, persona);
const patch = (persona: PersonaName | undefined, body: unknown) => jsonRequest('http://localhost/api/admin/billing/founding-discount', 'PATCH', body, persona);

describe('GET /api/admin/billing (internal cross-company billing view)', () => {
  beforeEach(() => vi.resetModules());

  it('is refused to customers, including company admins', async () => {
    const { GET } = await load(BILLING_PATH);
    for (const p of [undefined, 'employee', 'admin'] as const) expect((await GET(get(p))).status).toBe(403);
  });

  it('lists every company with its active employee count for a super admin', async () => {
    const { GET } = await load(BILLING_PATH);
    const body = await (await GET(get('superAdmin'))).json();
    expect(body.companies).toEqual([
      { id: 1, company_name: 'A', employee_count: 12 },
      { id: 2, company_name: 'B', employee_count: 40 },
    ]);
  });
});

describe('PATCH /api/admin/billing/founding-discount', () => {
  beforeEach(() => vi.resetModules());

  it('is refused to company admins', async () => {
    const { PATCH } = await load(DISCOUNT_PATH);
    expect((await PATCH(patch('admin', { company_id: 1, coupon_id: 'founding_customer_30' }))).status).toBe(403);
    expect(subscriptionsUpdate).not.toHaveBeenCalled();
  });

  it('only accepts the two founding coupons', async () => {
    const { PATCH } = await load(DISCOUNT_PATH);
    expect((await PATCH(patch('superAdmin', { company_id: 1, coupon_id: 'FREE100' }))).status).toBe(400);
  });

  it('409 when the company has no subscription', async () => {
    const { PATCH } = await load(DISCOUNT_PATH, { stripe_subscription_id: null });
    expect((await PATCH(patch('superAdmin', { company_id: 1, coupon_id: 'founding_customer_30' }))).status).toBe(409);
  });

  it('never applies the discount twice', async () => {
    const { PATCH } = await load(DISCOUNT_PATH, { founding_discount_applied_at: '2026-09-01' });
    expect((await PATCH(patch('superAdmin', { company_id: 1, coupon_id: 'founding_customer_40' }))).status).toBe(409);
    expect(subscriptionsUpdate).not.toHaveBeenCalled();
  });

  it('discounts only the base-fee item and records it', async () => {
    const { PATCH } = await load(DISCOUNT_PATH);
    const res = await PATCH(patch('superAdmin', { company_id: 1, coupon_id: 'founding_customer_40' }));
    expect(res.status).toBe(200);
    expect(subscriptionsUpdate).toHaveBeenCalledWith('sub_1', { items: [{ id: 'si_base', discounts: [{ coupon: 'founding_customer_40' }] }] });
    expect(writesTo(client, 'company')[0].payload).toMatchObject({ founding_discount_coupon_id: 'founding_customer_40' });
  });
});
