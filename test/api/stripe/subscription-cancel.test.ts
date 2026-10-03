import { describe, it, expect, vi, beforeEach } from 'vitest';

const ROUTE_PATH = '../../../src/app/api/stripe/subscription-cancel/route';

const ADMIN_USER_ID = 'admin-uuid';
const NON_ADMIN_USER_ID = 'non-admin-uuid';
const CALLER_COMPANY_ID = 100;
const VICTIM_COMPANY_ID = 999;

let stripeCancelMock: ReturnType<typeof vi.fn>;
let companyUpdateTarget: number | undefined;
let companyLookupTarget: number | undefined;

async function loadRoute(opts: { hasSubscription?: boolean } = {}) {
  vi.resetModules();
  const hasSubscription = opts.hasSubscription ?? true;
  companyUpdateTarget = undefined;
  companyLookupTarget = undefined;

  stripeCancelMock = vi.fn(async () => ({ canceled_at: 1234567890 }));
  vi.doMock('stripe', () => ({
    default: class {
      subscriptions = { cancel: stripeCancelMock };
    },
  }));

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) => {
        if (token === 'admin-token') return { data: { user: { id: ADMIN_USER_ID } }, error: null };
        if (token === 'non-admin-token') return { data: { user: { id: NON_ADMIN_USER_ID } }, error: null };
        return { data: { user: null }, error: new Error('invalid token') };
      },
    },
    from: (table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: (_c: string, id: string) => ({
              single: async () =>
                id === ADMIN_USER_ID
                  ? { data: { is_admin: true, is_super_admin: false }, error: null }
                  : { data: { is_admin: false, is_super_admin: false }, error: null },
            }),
          }),
        };
      }
      if (table === 'company_to_users') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { company_id: CALLER_COMPANY_ID }, error: null }),
            }),
          }),
        };
      }
      if (table === 'company') {
        return {
          select: () => ({
            eq: (_c: string, id: number) => {
              companyLookupTarget = id;
              return {
                single: async () =>
                  hasSubscription ? { data: { stripe_subscription_id: 'sub_123' }, error: null } : { data: { stripe_subscription_id: null }, error: null },
              };
            },
          }),
          update: (_payload: unknown) => ({
            eq: async (_c: string, id: number) => {
              companyUpdateTarget = id;
              return { data: null, error: null };
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

function req(token?: string, body: unknown = { company_id: VICTIM_COMPANY_ID }) {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (token) headers.set('authorization', `Bearer ${token}`);
  return new Request('http://localhost/api/stripe/subscription-cancel', { method: 'POST', headers, body: JSON.stringify(body) });
}

describe('POST /api/stripe/subscription-cancel', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: anyone could cancel any company\'s subscription)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
    expect(stripeCancelMock).not.toHaveBeenCalled();
  });

  it('rejects with 403 when caller is authenticated but not a company admin', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('non-admin-token'));
    expect(res.status).toBe(403);
    expect(stripeCancelMock).not.toHaveBeenCalled();
  });

  it("ignores an attacker-supplied company_id in the body and only ever acts on the caller's own company", async () => {
    const { POST } = await loadRoute();
    await POST(req('admin-token', { company_id: VICTIM_COMPANY_ID }));
    expect(companyLookupTarget).toBe(CALLER_COMPANY_ID);
    expect(companyLookupTarget).not.toBe(VICTIM_COMPANY_ID);
  });

  it("cancels the caller's own company subscription when they are an admin", async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('admin-token'));
    expect(res.status).toBe(200);
    expect(stripeCancelMock).toHaveBeenCalledWith('sub_123');
    expect(companyUpdateTarget).toBe(CALLER_COMPANY_ID);
  });

  it('returns 404 when the (own) company has no active subscription', async () => {
    const { POST } = await loadRoute({ hasSubscription: false });
    const res = await POST(req('admin-token'));
    expect(res.status).toBe(404);
    expect(stripeCancelMock).not.toHaveBeenCalled();
  });
});
