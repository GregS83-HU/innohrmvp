import { describe, it, expect, vi, beforeEach } from 'vitest';

const ROUTE_PATH = '../../../src/app/api/stripe/create-credit-session/route';

const ADMIN_USER_ID = 'admin-uuid';
const CALLER_COMPANY_ID = 100;
const VICTIM_COMPANY_ID = 999;

let checkoutCreateMock: ReturnType<typeof vi.fn>;
let companyLookupTarget: number | undefined;

async function loadRoute() {
  vi.resetModules();
  companyLookupTarget = undefined;
  checkoutCreateMock = vi.fn(async () => ({ id: 'cs_credit_123' }));

  vi.doMock('stripe', () => ({
    default: class {
      checkout = { sessions: { create: checkoutCreateMock } };
    },
  }));

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'admin-token' ? { data: { user: { id: ADMIN_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
    from: (table: string) => {
      if (table === 'users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { is_admin: true, is_super_admin: false }, error: null }) }) }) };
      if (table === 'company_to_users')
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: CALLER_COMPANY_ID }, error: null }) }) }) };
      if (table === 'company') {
        return {
          select: () => ({
            eq: (_c: string, id: number) => {
              companyLookupTarget = id;
              return { single: async () => ({ data: { stripe_customer_id: 'cus_abc' }, error: null }) };
            },
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, body: unknown = { company_id: VICTIM_COMPANY_ID, price_id: 'price_credits', credits: 100, return_url: 'https://app.example.com' }) {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (token) headers.set('authorization', `Bearer ${token}`);
  return new Request('http://localhost/api/stripe/create-credit-session', { method: 'POST', headers, body: JSON.stringify(body) });
}

describe('POST /api/stripe/create-credit-session', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: anyone could burn AI credits against any company)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
    expect(checkoutCreateMock).not.toHaveBeenCalled();
  });

  it("ignores an attacker-supplied company_id and only ever acts on the caller's own company", async () => {
    const { POST } = await loadRoute();
    await POST(req('admin-token', { company_id: VICTIM_COMPANY_ID, price_id: 'price_credits', credits: 100, return_url: 'https://x' }));
    expect(companyLookupTarget).toBe(CALLER_COMPANY_ID);
  });

  it('creates a checkout session for the caller\'s own company when they are an admin', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('admin-token'));
    expect(res.status).toBe(200);
    expect(checkoutCreateMock).toHaveBeenCalledWith(expect.objectContaining({ customer: 'cus_abc' }));
  });
});
