import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/timeclock/route';
const ENTITLEMENTS_PATH = '../../lib/entitlements';

const CALLER_USER_ID = 'caller-uuid';
const VICTIM_USER_ID = 'victim-uuid';

async function loadRoute() {
  vi.resetModules();
  vi.doMock(ENTITLEMENTS_PATH, () => ({ hasFeatureAccess: vi.fn(async () => ({ allowed: true })), entitlementErrorBody: () => ({ error: 'not entitled' }) }));

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'caller-token' ? { data: { user: { id: CALLER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
    from: (table: string) => {
      if (table === 'company_to_users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: 100 }, error: null }) }) }) };
      if (table === 'time_entries') {
        return {
          select: () => ({
            eq: () => ({
              gte: () => ({ lte: () => ({ order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) }),
            }),
          }),
          insert: () => ({ select: () => ({ single: async () => ({ data: { id: 1, user_id: CALLER_USER_ID }, error: null }) }) }),
        };
      }
      if (table === 'user_shifts') {
        return {
          select: () => ({
            eq: () => ({ lte: () => ({ or: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

describe('GET /api/timeclock', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: any userId query param leaked that user\'s clock status)', async () => {
    const { GET } = await loadRoute();
    const res = await GET(requestWithAuth(`http://localhost/api/timeclock?userId=${CALLER_USER_ID}&action=status`));
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when the caller queries a different user's status (impersonation attempt)", async () => {
    const { GET } = await loadRoute();
    const res = await GET(requestWithAuth(`http://localhost/api/timeclock?userId=${VICTIM_USER_ID}&action=status`, {}, 'caller-token'));
    expect(res.status).toBe(403);
  });

  it('returns status for the caller\'s own userId', async () => {
    const { GET } = await loadRoute();
    const res = await GET(requestWithAuth(`http://localhost/api/timeclock?userId=${CALLER_USER_ID}&action=status`, {}, 'caller-token'));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/timeclock', () => {
  beforeEach(() => vi.resetModules());

  function req(token?: string, userId = CALLER_USER_ID) {
    return requestWithAuth('http://localhost/api/timeclock', { method: 'POST', body: JSON.stringify({ userId, action: 'clock_in' }) }, token);
  }

  it('rejects with 401 when no auth header is present (previously: anyone could clock any employee in/out)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when clocking in a different user (impersonation attempt)", async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('caller-token', VICTIM_USER_ID));
    expect(res.status).toBe(403);
  });

  it('clocks the caller in for their own userId', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('caller-token', CALLER_USER_ID));
    expect(res.status).toBe(200);
  });
});
