import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../../helpers/supabaseMock';
import {
  superAdminAuthHandler,
  usersTableHandler,
  requestWithAuth,
  VALID_SUPER_ADMIN_TOKEN,
  VALID_REGULAR_TOKEN,
} from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/admin/funnel/route';

async function loadRoute() {
  vi.resetModules();
  const client = createSupabaseMock({
    auth: superAdminAuthHandler,
    tables: {
      users: usersTableHandler(),
      funnel_events: () => ({ data: [], error: null, count: 5 }),
      company: () => ({ data: [], error: null, count: 2 }),
    },
  });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
  return import(ROUTE_PATH);
}

function req(token?: string) {
  return requestWithAuth('http://localhost/api/admin/funnel?from=2026-01-01&to=2026-01-31', {}, token);
}

describe('GET /api/admin/funnel', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 403 when no auth token is present', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req());
    expect(res.status).toBe(403);
  });

  it('rejects with 403 when caller is not a super admin', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req(VALID_REGULAR_TOKEN));
    expect(res.status).toBe(403);
  });

  it('returns funnel data for a super admin', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req(VALID_SUPER_ADMIN_TOKEN));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.funnel.jobAssistantStarted).toBe(5);
    expect(body.funnel.companiesOnboarded).toBe(2);
  });
});
