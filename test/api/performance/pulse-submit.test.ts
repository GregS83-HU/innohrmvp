import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/performance/pulse/submit/route';
const ENTITLEMENTS_PATH = '../../../lib/entitlements';

const EMPLOYEE_ID = 'employee-uuid';
const MANAGER_ID = 'manager-uuid';
const OUTSIDER_ID = 'outsider-uuid';

async function loadRoute() {
  vi.resetModules();
  vi.doMock(ENTITLEMENTS_PATH, () => ({
    resolveCompanyIdForUser: vi.fn(async () => 1),
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
      if (table === 'user_profiles') return { select: () => ({ eq: () => ({ single: async () => ({ data: { manager_id: MANAGER_ID }, error: null }) }) }) };
      if (table === 'company_to_users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: 1 }, error: null }) }) }) };
      if (table === 'users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { is_admin: false, is_super_admin: false }, error: null }) }) }) };
      if (table === 'goal_updates') {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) }),
          insert: () => ({ select: async () => ({ data: [{ id: 1, goal_id: 1, employee_id: EMPLOYEE_ID }], error: null }) }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
    rpc: () => Promise.resolve({ data: '2026-01-01', error: null }),
  };
  vi.doMock('@supabase/ssr', () => ({ createServerClient: () => fakeSupabase }));
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }));
  return import(ROUTE_PATH);
}

function req(token?: string, employeeId = EMPLOYEE_ID) {
  return requestWithAuth(
    'http://localhost/api/performance/pulse/submit',
    { method: 'POST', body: JSON.stringify({ goal_id: 1, status: 'green', employee_id: employeeId }) },
    token
  );
}

describe('POST /api/performance/pulse/submit', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: anyone could submit a pulse "as" any employee_id)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it('rejects with 403 when the caller is unrelated to the employee', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('outsider-token'));
    expect(res.status).toBe(403);
  });

  it('allows the employee to submit their own pulse', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('employee-token'));
    expect(res.status).toBe(200);
  });

  it("allows the employee's real manager to submit on their behalf", async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('manager-token'));
    expect(res.status).toBe(200);
  });
});
