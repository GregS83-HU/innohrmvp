import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/users/update-manager/route';

const ADMIN_USER_ID = 'admin-uuid';
const CALLER_COMPANY_ID = 100;
const OTHER_COMPANY_ID = 200;
const USER_COMPANY: Record<string, number> = { 'victim-in-own-company': CALLER_COMPANY_ID, 'victim-elsewhere': OTHER_COMPANY_ID };

let profileUpsertCalled = false;

async function loadRoute() {
  vi.resetModules();
  profileUpsertCalled = false;

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
                if (state.companyId === undefined) {
                  return { data: { company_id: CALLER_COMPANY_ID }, error: null };
                }
                const belongs = USER_COMPANY[state.userId as string] === state.companyId;
                return belongs ? { data: { company_id: state.companyId }, error: null } : { data: null, error: new Error('not found') };
              },
            };
            return builder;
          },
        };
      }
      if (table === 'user_profiles') {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error('not found') }) }) }),
          insert: (_payload: unknown) => {
            profileUpsertCalled = true;
            return Promise.resolve({ data: null, error: null });
          },
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, userId = 'victim-in-own-company', managerId = 'some-manager') {
  return requestWithAuth(
    'http://localhost/api/users/update-manager',
    { method: 'PATCH', body: JSON.stringify({ userId, managerId }) },
    token
  );
}

describe('PATCH /api/users/update-manager', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: anyone could reassign any user\'s manager)', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req());
    expect(res.status).toBe(401);
    expect(profileUpsertCalled).toBe(false);
  });

  it("rejects with 404 when the target user does not belong to the admin's company (cross-tenant attempt)", async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req('admin-token', 'victim-elsewhere'));
    expect(res.status).toBe(404);
    expect(profileUpsertCalled).toBe(false);
  });

  it("reassigns the manager when the target user belongs to the admin's own company", async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req('admin-token', 'victim-in-own-company'));
    expect(res.status).toBe(200);
    expect(profileUpsertCalled).toBe(true);
  });
});
