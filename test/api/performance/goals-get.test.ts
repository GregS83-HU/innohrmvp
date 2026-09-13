import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/performance/goals/route';

const MANAGER_USER_ID = 'manager-uuid';
const TEAM_MEMBER_ID = 'team-member-uuid';
const OUTSIDER_ID = 'outsider-uuid';

async function loadRoute() {
  vi.resetModules();

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'manager-token' ? { data: { user: { id: MANAGER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
    from: (table: string) => {
      if (table === 'user_profiles') {
        return {
          select: () => ({
            eq: (_c: string, managerId: string) =>
              Promise.resolve(
                managerId === MANAGER_USER_ID ? { data: [{ user_id: TEAM_MEMBER_ID }], error: null } : { data: [], error: null }
              ),
          }),
        };
      }
      if (table === 'v_goals_with_status') {
        return {
          select: () => ({
            eq: (_c: string, _v: string) => ({ order: async () => ({ data: [{ id: 1 }], error: null }) }),
            in: (_c: string, _ids: string[]) => ({ order: async () => ({ data: [{ id: 1 }], error: null }) }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/ssr', () => ({ createServerClient: () => fakeSupabase }));
  vi.doMock('@supabase/supabase-js', () => ({
    createClient: () => ({
      auth: {
        getUser: async (token: string) =>
          token === 'manager-token' ? { data: { user: { id: MANAGER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
      },
    }),
  }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }));
  return import(ROUTE_PATH);
}

function req(token?: string, params = `user_id=${MANAGER_USER_ID}`) {
  return requestWithAuth(`http://localhost/api/performance/goals?${params}`, {}, token);
}

describe('GET /api/performance/goals', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: any user_id query param was trusted outright)', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when the caller claims a different user_id (impersonation attempt)", async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('manager-token', `user_id=${OUTSIDER_ID}`));
    expect(res.status).toBe(403);
  });

  it('returns the employee\'s own goals for the employee view', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('manager-token', `user_id=${MANAGER_USER_ID}`));
    expect(res.status).toBe(200);
  });

  it(
    "rejects with 403 when the manager view requests an employee_id that is not actually a report (previously: the real team was computed then silently discarded)",
    async () => {
      const { GET } = await loadRoute();
      const res = await GET(req('manager-token', `user_id=${MANAGER_USER_ID}&view=manager&employee_id=${OUTSIDER_ID}`));
      expect(res.status).toBe(403);
    }
  );

  it('returns goals for a real report requested by name in the manager view', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('manager-token', `user_id=${MANAGER_USER_ID}&view=manager&employee_id=${TEAM_MEMBER_ID}`));
    expect(res.status).toBe(200);
  });

  it('returns the whole team\'s goals when no specific employee_id is requested', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('manager-token', `user_id=${MANAGER_USER_ID}&view=manager`));
    expect(res.status).toBe(200);
  });
});
