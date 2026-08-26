import { describe, it, expect, vi, beforeEach } from 'vitest';

const ROUTE_PATH = '../../../src/app/api/stripe/subscription/route';

const MEMBER_USER_ID = 'member-uuid';
const CALLER_COMPANY_ID = 100;
const VICTIM_COMPANY_ID = 999;

let companyLookupTarget: number | undefined;

async function loadRoute() {
  vi.resetModules();
  companyLookupTarget = undefined;

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'member-token' ? { data: { user: { id: MEMBER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
    from: (table: string) => {
      if (table === 'company_to_users')
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: CALLER_COMPANY_ID }, error: null }) }) }) };
      if (table === 'company') {
        return {
          select: () => ({
            eq: (_c: string, id: number) => {
              companyLookupTarget = id;
              return { single: async () => ({ data: { forfait: 'momentum', stripe_subscription_id: 'sub_1' }, error: null }) };
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

function req(token?: string, companyIdParam = VICTIM_COMPANY_ID.toString()) {
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  return new Request(`http://localhost/api/stripe/subscription?company_id=${companyIdParam}`, { headers });
}

describe('GET /api/stripe/subscription', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: anyone could read any company\'s plan/subscription status)', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("ignores an attacker-supplied company_id query param and only ever reads the caller's own company", async () => {
    const { GET } = await loadRoute();
    await GET(req('member-token', VICTIM_COMPANY_ID.toString()));
    expect(companyLookupTarget).toBe(CALLER_COMPANY_ID);
  });

  it("returns the caller's own company subscription status", async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('member-token'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.subscription.plan).toBe('momentum');
    expect(body.subscription.status).toBe('Active');
  });
});
