import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/performance/goals/update/route';
const ENTITLEMENTS_PATH = '../../../lib/entitlements';

const EMPLOYEE_ID = 'u1';
const MANAGER_ID = 'manager-uuid';
const OUTSIDER_ID = 'outsider-uuid';

let orFilterUsed: string | undefined;
let deleteEqFilters: Record<string, unknown> | undefined;

async function loadRoute(opts: { entitled?: boolean; matches?: boolean } = {}) {
  vi.resetModules();
  orFilterUsed = undefined;
  deleteEqFilters = undefined;
  const entitled = opts.entitled ?? true;
  const matches = opts.matches ?? true;

  vi.doMock(ENTITLEMENTS_PATH, () => ({
    resolveCompanyIdForUser: vi.fn(async () => 1),
    hasFeatureAccess: vi.fn(async () => (entitled ? { allowed: true } : { allowed: false, reason: 'not_entitled' })),
    entitlementErrorBody: (feature: string, result: unknown) => ({ error: 'not entitled', feature, result }),
  }));

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) => {
        if (token === 'employee-token') return { data: { user: { id: EMPLOYEE_ID } }, error: null };
        if (token === 'manager-token') return { data: { user: { id: MANAGER_ID } }, error: null };
        if (token === 'outsider-token') return { data: { user: { id: OUTSIDER_ID } }, error: null };
        return { data: { user: null }, error: new Error('invalid') };
      },
    },
    from: (table: string) => {
      if (table === 'user_profiles') {
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { manager_id: MANAGER_ID }, error: null }) }) }) };
      }
      if (table === 'company_to_users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: 1 }, error: null }) }) }) };
      if (table === 'users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { is_admin: false, is_super_admin: false }, error: null }) }) }) };
      if (table === 'performance_goals') {
        return {
          update: (_payload: unknown) => ({
            eq: (_col: string, _val: unknown) => ({
              or: (expr: string) => {
                orFilterUsed = expr;
                return {
                  select: async () => (matches ? { data: [{ id: 1, goal_title: 'Updated' }], error: null } : { data: [], error: null }),
                };
              },
            }),
          }),
          delete: () => ({
            eq: (col1: string, val1: unknown) => ({
              eq: async (col2: string, val2: unknown) => {
                deleteEqFilters = { [col1]: val1, [col2]: val2 };
                return { error: null };
              },
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/ssr', () => ({ createServerClient: () => fakeSupabase }));
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }));

  return import(ROUTE_PATH);
}

function patchReq(body: unknown, token?: string) {
  return requestWithAuth('http://localhost/api/performance/goals/update', { method: 'PATCH', body: JSON.stringify(body) }, token);
}

function deleteReq(goalId: number, userId: string, token?: string) {
  return requestWithAuth(`http://localhost/api/performance/goals/update?goal_id=${goalId}&user_id=${userId}`, { method: 'DELETE' }, token);
}

describe('PATCH /api/performance/goals/update', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 400 when goal_id is missing', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(patchReq({ user_id: EMPLOYEE_ID }, 'employee-token'));
    expect(res.status).toBe(400);
  });

  it('rejects with 401 when no auth header is present (previously: user_id was trusted outright)', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(patchReq({ goal_id: 1, user_id: EMPLOYEE_ID, status: 'active' }));
    expect(res.status).toBe(401);
  });

  it('rejects with 403 when the caller is unrelated to the goal\'s employee (not self, not their manager)', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(patchReq({ goal_id: 1, user_id: EMPLOYEE_ID, status: 'active' }, 'outsider-token'));
    expect(res.status).toBe(403);
  });

  it('rejects with 403 when the resolved company is not entitled', async () => {
    const { PATCH } = await loadRoute({ entitled: false });
    const res = await PATCH(patchReq({ goal_id: 1, user_id: EMPLOYEE_ID, status: 'active' }, 'employee-token'));
    expect(res.status).toBe(403);
  });

  it('builds an employee-or-manager row filter using the supplied user_id', async () => {
    const { PATCH } = await loadRoute();
    await PATCH(patchReq({ goal_id: 1, user_id: EMPLOYEE_ID, status: 'active' }, 'employee-token'));
    expect(orFilterUsed).toBe(`employee_id.eq.${EMPLOYEE_ID},manager_id.eq.${EMPLOYEE_ID}`);
  });

  it('returns 404 when no row matches the owner-or-manager filter', async () => {
    const { PATCH } = await loadRoute({ matches: false });
    const res = await PATCH(patchReq({ goal_id: 1, user_id: EMPLOYEE_ID, status: 'active' }, 'employee-token'));
    expect(res.status).toBe(404);
  });

  it('allows the employee to update their own goal', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(patchReq({ goal_id: 1, user_id: EMPLOYEE_ID, status: 'active' }, 'employee-token'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.goal).toEqual({ id: 1, goal_title: 'Updated' });
  });

  it("allows the employee's real manager to update the goal", async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(patchReq({ goal_id: 1, user_id: EMPLOYEE_ID, status: 'active' }, 'manager-token'));
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/performance/goals/update', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present', async () => {
    const { DELETE } = await loadRoute();
    const res = await DELETE(deleteReq(1, EMPLOYEE_ID));
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when the caller is the employee's manager, not the employee themselves (self-only for delete)", async () => {
    const { DELETE } = await loadRoute();
    const res = await DELETE(deleteReq(1, EMPLOYEE_ID, 'manager-token'));
    expect(res.status).toBe(403);
  });

  it('allows the employee to delete their own draft goal', async () => {
    const { DELETE } = await loadRoute();
    const res = await DELETE(deleteReq(1, EMPLOYEE_ID, 'employee-token'));
    expect(res.status).toBe(200);
    expect(deleteEqFilters).toEqual({ id: '1', employee_id: EMPLOYEE_ID });
  });
});
