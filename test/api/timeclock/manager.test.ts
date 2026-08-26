import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/timeclock/manager/route';
const ENTITLEMENTS_PATH = '../../../lib/entitlements';

const MANAGER_USER_ID = 'manager-uuid';
const OTHER_MANAGER_ID = 'other-manager-uuid';
const ADMIN_USER_ID = 'admin-uuid';
const MANAGER_COMPANY_ID = 100;
const OTHER_COMPANY_ID = 200;

async function loadRoute(opts: { entitled?: boolean; adminCompanyId?: number } = {}) {
  vi.resetModules();
  const entitled = opts.entitled ?? true;
  const adminCompanyId = opts.adminCompanyId ?? MANAGER_COMPANY_ID;

  vi.doMock(ENTITLEMENTS_PATH, () => ({
    resolveCompanyIdForUser: vi.fn(async (userId: string) => (userId === MANAGER_USER_ID ? MANAGER_COMPANY_ID : null)),
    hasFeatureAccess: vi.fn(async () => (entitled ? { allowed: true } : { allowed: false, reason: 'not_entitled' })),
    entitlementErrorBody: () => ({ error: 'not entitled' }),
  }));

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) => {
        if (token === 'manager-token') return { data: { user: { id: MANAGER_USER_ID } }, error: null };
        if (token === 'other-manager-token') return { data: { user: { id: OTHER_MANAGER_ID } }, error: null };
        if (token === 'admin-token') return { data: { user: { id: ADMIN_USER_ID } }, error: null };
        return { data: { user: null }, error: new Error('invalid') };
      },
    },
    from: (table: string) => {
      if (table === 'users')
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
      if (table === 'company_to_users')
        return {
          select: () => ({
            eq: (_c: string, id: string) => ({
              single: async () =>
                id === ADMIN_USER_ID
                  ? { data: { company_id: adminCompanyId }, error: null }
                  : { data: null, error: new Error('not found') },
            }),
          }),
        };
      if (table === 'time_entries')
        return {
          select: () => ({
            eq: () => ({ single: async () => ({ data: { user_id: MANAGER_USER_ID }, error: null }) }),
          }),
        };
      throw new Error(`unexpected table ${table}`);
    },
    rpc: (_fn: string, _args: unknown) => Promise.resolve({ data: [], error: null }),
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase, SupabaseClient: class {} }));
  return import(ROUTE_PATH);
}

function getReq(token?: string, managerId = MANAGER_USER_ID) {
  return requestWithAuth(`http://localhost/api/timeclock/manager?managerId=${managerId}&action=team-today`, {}, token);
}

describe('GET /api/timeclock/manager', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: managerId query param was trusted outright)', async () => {
    const { GET } = await loadRoute();
    const res = await GET(getReq());
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when the caller claims to be a different manager they aren't (cross-identity attempt)", async () => {
    const { GET } = await loadRoute();
    const res = await GET(getReq('other-manager-token', MANAGER_USER_ID));
    expect(res.status).toBe(403);
  });

  it('allows the manager to view their own team', async () => {
    const { GET } = await loadRoute();
    const res = await GET(getReq('manager-token', MANAGER_USER_ID));
    expect(res.status).toBe(200);
  });

  it("allows an admin of the manager's own company to view that team", async () => {
    const { GET } = await loadRoute({ adminCompanyId: MANAGER_COMPANY_ID });
    const res = await GET(getReq('admin-token', MANAGER_USER_ID));
    expect(res.status).toBe(200);
  });

  it("rejects an admin of a different company (cross-tenant attempt)", async () => {
    const { GET } = await loadRoute({ adminCompanyId: OTHER_COMPANY_ID });
    const res = await GET(getReq('admin-token', MANAGER_USER_ID));
    expect(res.status).toBe(403);
  });
});

describe('POST /api/timeclock/manager (approve-entry)', () => {
  beforeEach(() => vi.resetModules());

  function postReq(token?: string, managerId = MANAGER_USER_ID) {
    return requestWithAuth(
      'http://localhost/api/timeclock/manager',
      { method: 'POST', body: JSON.stringify({ managerId, action: 'approve-entry', entryId: 1, status: 'approved' }) },
      token
    );
  }

  it('rejects with 401 when no auth header is present', async () => {
    const { POST } = await loadRoute();
    const res = await POST(postReq());
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when the caller claims to be a different manager (previously: only the target entry's team membership was checked, never the caller's identity)", async () => {
    const { POST } = await loadRoute();
    const res = await POST(postReq('other-manager-token', MANAGER_USER_ID));
    expect(res.status).toBe(403);
  });
});
