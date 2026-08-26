import { describe, it, expect, vi, beforeEach } from 'vitest';

const ROUTE_PATH = '../../../src/app/api/happiness/dashboard/route';

const MEMBER_USER_ID = 'member-uuid';
const COMPANY_A = 100;
const COMPANY_B = 200;

// Sessions across two companies - the fixed route must only ever surface
// Company A's session to a Company A caller.
const SESSIONS = [
  { overall_happiness_score: 9, perma_scores: {}, status: 'completed', created_at: '2026-01-01', company_id: COMPANY_A },
  { overall_happiness_score: 1, perma_scores: {}, status: 'completed', created_at: '2026-01-01', company_id: COMPANY_B },
];

let sessionsQueryCompanyFilter: number | undefined;
let metricsQueryCompanyFilter: number | undefined;

async function loadRoute() {
  vi.resetModules();
  sessionsQueryCompanyFilter = undefined;
  metricsQueryCompanyFilter = undefined;

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'member-token' ? { data: { user: { id: MEMBER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
    from: (table: string) => {
      if (table === 'company_to_users')
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: COMPANY_A }, error: null }) }) }) };
      if (table === 'happiness_daily_metrics') {
        return {
          select: () => ({
            eq: (_c: string, companyId: number) => {
              metricsQueryCompanyFilter = companyId;
              return {
                gte: () => ({
                  order: async () => ({ data: [], error: null }),
                }),
              };
            },
          }),
        };
      }
      if (table === 'happiness_sessions') {
        return {
          select: () => ({
            gte: () => ({
              eq: (_c1: string, _v1: string) => ({
                eq: (_c2: string, companyId: number) => {
                  sessionsQueryCompanyFilter = companyId;
                  return Promise.resolve({ data: SESSIONS.filter((s) => s.company_id === companyId), error: null });
                },
              }),
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string) {
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  return new Request('http://localhost/api/happiness/dashboard?days=30', { headers });
}

describe('GET /api/happiness/dashboard', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: any user_id query param worked, no session check)', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("only aggregates the caller's own company's sessions, not another company's (cross-tenant leak closed)", async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('member-token'));
    expect(res.status).toBe(200);
    expect(sessionsQueryCompanyFilter).toBe(COMPANY_A);
    expect(metricsQueryCompanyFilter).toBe(COMPANY_A);
    const body = await res.json();
    // Only Company A's single session (score 9) should be aggregated.
    expect(body.summary.totalSessions).toBe(1);
    expect(body.summary.avgHappiness).toBe(9);
  });
});
