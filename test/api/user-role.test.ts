import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/user-role/route';

const CALLER_USER_ID = 'caller-uuid';
const VICTIM_USER_ID = 'victim-uuid';

async function loadRoute() {
  vi.resetModules();
  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'caller-token' ? { data: { user: { id: CALLER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
    from: (table: string) => {
      if (table === 'users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { is_manager: true, is_admin: false }, error: null }) }) }) };
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, userIdParam = CALLER_USER_ID) {
  return requestWithAuth(`http://localhost/api/user-role?userId=${userIdParam}`, {}, token);
}

describe('GET /api/user-role', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: any userId query param leaked that user\'s admin/manager flags)', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when the caller queries a different user's role (info-disclosure attempt)", async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('caller-token', VICTIM_USER_ID));
    expect(res.status).toBe(403);
  });

  it('returns role for the caller\'s own userId', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('caller-token', CALLER_USER_ID));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.is_manager).toBe(true);
  });
});
