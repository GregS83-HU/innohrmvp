import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/performance/goals/create/route';
const ENTITLEMENTS_PATH = '../../../lib/entitlements';

const EMPLOYEE_ID = 'employee-uuid';
const MANAGER_ID = 'manager-uuid';
const OUTSIDER_ID = 'outsider-uuid';

async function loadRoute() {
  vi.resetModules();
  vi.doMock(ENTITLEMENTS_PATH, () => ({
    hasFeatureAccess: vi.fn(async () => ({ allowed: true })),
    entitlementErrorBody: () => ({ error: 'not entitled' }),
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
      if (table === 'company_to_users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: 100 }, error: null }) }) }) };
      if (table === 'user_profiles') {
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { manager_id: MANAGER_ID }, error: null }) }) }) };
      }
      if (table === 'users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { is_admin: false, is_super_admin: false }, error: null }) }) }) };
      if (table === 'performance_goals') return { insert: () => ({ select: async () => ({ data: [{ id: 1, employee_id: EMPLOYEE_ID }], error: null }) }) };
      throw new Error(`unexpected table ${table}`);
    },
    rpc: () => Promise.resolve({ data: 'Q1', error: null }),
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, employeeId = EMPLOYEE_ID) {
  return requestWithAuth(
    'http://localhost/api/performance/goals/create',
    { method: 'POST', body: JSON.stringify({ employee_id: employeeId, goal_title: 'Grow', created_by: 'employee' }) },
    token
  );
}

describe('POST /api/performance/goals/create', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: anyone could create a goal for any employee_id)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it('rejects with 403 when the caller is unrelated to the employee (not self, not their manager)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('outsider-token'));
    expect(res.status).toBe(403);
  });

  it('allows the employee to create their own draft goal', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('employee-token'));
    expect(res.status).toBe(200);
  });

  it("allows the employee's real manager to create a goal for them", async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('manager-token'));
    expect(res.status).toBe(200);
  });
});
