import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/users/users-creation/route';
const ENTITLEMENTS_PATH = '../../../lib/entitlements';

const ADMIN_USER_ID = 'admin-uuid';
const CALLER_COMPANY_ID = 100;
const VICTIM_COMPANY_ID = 999;

let createdUserCompanyId: number | undefined;

async function loadRoute(opts: { entitled?: boolean } = {}) {
  vi.resetModules();
  const entitled = opts.entitled ?? true;
  createdUserCompanyId = undefined;

  vi.doMock(ENTITLEMENTS_PATH, () => ({
    hasFeatureAccess: vi.fn(async () => (entitled ? { allowed: true } : { allowed: false, reason: 'plan_limit_reached' })),
    entitlementErrorBody: () => ({ error: 'not entitled' }),
  }));

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'admin-token' ? { data: { user: { id: ADMIN_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
      admin: {
        createUser: vi.fn(async () => ({ data: { user: { id: 'new-user-id' } }, error: null })),
        deleteUser: vi.fn(async () => ({ data: null, error: null })),
      },
    },
    from: (table: string) => {
      if (table === 'users') {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: { is_admin: true, is_super_admin: false }, error: null }) }) }),
          insert: () => Promise.resolve({ data: null, error: null }),
        };
      }
      if (table === 'company_to_users') {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: CALLER_COMPANY_ID }, error: null }) }) }),
          insert: (payload: { company_id: number }) => {
            createdUserCompanyId = payload.company_id;
            return Promise.resolve({ data: null, error: null });
          },
          delete: () => ({ eq: async () => ({ data: null, error: null }) }),
        };
      }
      if (table === 'user_profiles') {
        return { insert: () => Promise.resolve({ data: null, error: null }) };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, companyId: unknown = VICTIM_COMPANY_ID) {
  return requestWithAuth(
    'http://localhost/api/users/users-creation',
    {
      method: 'POST',
      body: JSON.stringify({
        email: 'new@x.com',
        password: 'pw123456',
        firstName: 'New',
        lastName: 'User',
        companyId,
        managerId: 'mgr-1',
        employmentStartDate: '2026-01-01',
      }),
    },
    token
  );
}

describe('POST /api/users/users-creation', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: anyone could create a user, including admins, in any company)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it("ignores an attacker-supplied companyId and only ever creates the user in the caller's own company", async () => {
    const { POST } = await loadRoute();
    await POST(req('admin-token', VICTIM_COMPANY_ID));
    expect(createdUserCompanyId).toBe(CALLER_COMPANY_ID);
  });

  it('creates the user in the admin\'s own company when entitled', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('admin-token'));
    expect(res.status).toBe(200);
  });

  it('rejects with 403 when the admin\'s own company is not entitled to add employees', async () => {
    const { POST } = await loadRoute({ entitled: false });
    const res = await POST(req('admin-token'));
    expect(res.status).toBe(403);
  });
});
