import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/entitlements/status/route';
const ENTITLEMENTS_PATH = '../../lib/entitlements';

const CALLER_USER_ID = 'caller-uuid';
const VICTIM_USER_ID = 'victim-uuid';

async function loadRoute() {
  vi.resetModules();
  vi.doMock(ENTITLEMENTS_PATH, () => ({ hasFeatureAccess: vi.fn(async () => ({ allowed: true, plan: 'momentum' })) }));

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'caller-token' ? { data: { user: { id: CALLER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
    from: (table: string) => {
      if (table === 'users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { is_admin: true }, error: null }) }) }) };
      if (table === 'company_to_users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: 100 }, error: null }) }) }) };
      if (table === 'company') return { select: () => ({ eq: () => ({ single: async () => ({ data: { onboarding_completed: true }, error: null }) }) }) };
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, userIdParam = CALLER_USER_ID) {
  return requestWithAuth(`http://localhost/api/entitlements/status?userId=${userIdParam}`, {}, token);
}

describe('GET /api/entitlements/status', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: any userId query param was trusted outright)', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when the caller queries a different user's status (info-disclosure attempt)", async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('caller-token', VICTIM_USER_ID));
    expect(res.status).toBe(403);
  });

  it('returns status for the caller\'s own userId', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('caller-token', CALLER_USER_ID));
    expect(res.status).toBe(200);
  });
});
