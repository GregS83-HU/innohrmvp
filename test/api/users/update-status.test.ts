import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/users/update-status/route';

const ADMIN_USER_ID = 'admin-uuid';
const CALLER_COMPANY_ID = 100;
const OTHER_COMPANY_ID = 200;
// victim-in-own-company belongs to the admin's company; victim-elsewhere does not.
const USER_COMPANY: Record<string, number> = { 'victim-in-own-company': CALLER_COMPANY_ID, 'victim-elsewhere': OTHER_COMPANY_ID };

let updateCalled = false;

async function loadRoute() {
  vi.resetModules();
  updateCalled = false;

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'admin-token' ? { data: { user: { id: ADMIN_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
    from: (table: string) => {
      if (table === 'users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { is_admin: true, is_super_admin: false }, error: null }) }) }) };
      if (table === 'company_to_users') {
        return {
          select: (_cols?: string) => {
            const state: { userId?: string; companyId?: number } = {};
            const builder: any = {
              eq(col: string, val: unknown) {
                if (col === 'user_id') state.userId = val as string;
                if (col === 'company_id') state.companyId = val as number;
                return builder;
              },
              single: async () => {
                // requireCompanyAdmin's own resolution query filters only by
                // user_id (no company_id) - the route's explicit target-user
                // check filters by both. Distinguish on that, not on which
                // userId is present (the admin's own userId is present in
                // both cases).
                if (state.companyId === undefined) {
                  return { data: { company_id: CALLER_COMPANY_ID }, error: null };
                }
                const belongs = USER_COMPANY[state.userId as string] === state.companyId;
                return belongs ? { data: { company_id: state.companyId }, error: null } : { data: null, error: new Error('not found') };
              },
            };
            return builder;
          },
          update: (_payload: unknown) => ({
            eq: () => ({
              eq: () => ({
                select: async () => {
                  updateCalled = true;
                  return { data: [{ user_id: 'victim-in-own-company', is_active: false }], error: null };
                },
              }),
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, userId = 'victim-in-own-company', isActive = false) {
  return requestWithAuth(
    'http://localhost/api/users/update-status',
    { method: 'PATCH', body: JSON.stringify({ userId, isActive }) },
    token
  );
}

describe('PATCH /api/users/update-status', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: anyone could activate/deactivate any user in any company)', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req());
    expect(res.status).toBe(401);
    expect(updateCalled).toBe(false);
  });

  it("rejects with 404 when the target user does not belong to the admin's company (cross-tenant attempt)", async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req('admin-token', 'victim-elsewhere'));
    expect(res.status).toBe(404);
    expect(updateCalled).toBe(false);
  });

  it("updates the status when the target user belongs to the admin's own company", async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req('admin-token', 'victim-in-own-company'));
    expect(res.status).toBe(200);
    expect(updateCalled).toBe(true);
  });
});
