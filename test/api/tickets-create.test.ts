import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/tickets/create/route';
const ENTITLEMENTS_PATH = '../../lib/entitlements';

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
      if (table === 'users') {
        return {
          select: (cols: string) => ({
            eq: () => ({
              single: async () =>
                cols.includes('is_admin')
                  ? { data: { is_admin: false, is_super_admin: false }, error: null }
                  : { data: { email: 'e@x.com', user_firstname: 'Em', user_lastname: 'Ployee' }, error: null },
            }),
          }),
        };
      }
      if (table === 'tickets') return { insert: () => ({ select: () => ({ single: async () => ({ data: { id: 1, user_id: EMPLOYEE_ID }, error: null }) }) }) };
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, userId = EMPLOYEE_ID) {
  return requestWithAuth(
    'http://localhost/api/tickets/create',
    { method: 'POST', body: JSON.stringify({ user_id: userId, title: 'Help', description: 'Need help' }) },
    token
  );
}

describe('POST /api/tickets/create', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: anyone could create a ticket "as" any user_id, attaching their real name/email)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it('rejects with 403 when the caller is unrelated to the ticket owner', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('outsider-token'));
    expect(res.status).toBe(403);
  });

  it('allows the employee to create their own ticket', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('employee-token'));
    expect(res.status).toBe(201);
  });

  it("allows the employee's real manager to create it on their behalf", async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('manager-token'));
    expect(res.status).toBe(201);
  });
});
