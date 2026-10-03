import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../../helpers/supabaseMock';

const ROUTE_PATH = '../../../src/app/api/stats/route/[positionId]/route';

const CALLER_USER_ID = 'caller-uuid';
const CALLER_COMPANY_ID = 100;

async function loadRoute(opts: { positionExists?: boolean; positionCompanyId?: number } = {}) {
  vi.resetModules();
  const positionExists = opts.positionExists ?? true;
  const positionCompanyId = opts.positionCompanyId ?? CALLER_COMPANY_ID;
  const client = createSupabaseMock({
    auth: (token: string) => {
      if (token === 'valid-token') return { data: { user: { id: CALLER_USER_ID } }, error: null };
      return { data: { user: null }, error: new Error('invalid token') };
    },
    tables: {
      openedpositions: () =>
        positionExists ? { data: { company_id: positionCompanyId }, error: null } : { data: null, error: new Error('not found') },
      company_to_users: (state) => {
        const targetCompany = state.filters['company_id'];
        if (targetCompany === CALLER_COMPANY_ID) return { data: { company_id: CALLER_COMPANY_ID }, error: null };
        return { data: null, error: new Error('not found') };
      },
      position_to_candidat: () => ({ data: [{ candidat_id: 1, candidat_score: 8 }], error: null }),
    },
  });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  return import(ROUTE_PATH);
}

function req(url: string, token?: string) {
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  return new Request(url, { headers });
}

describe('GET /api/stats/route/[positionId]', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('http://localhost/api/stats/route/42'));
    expect(res.status).toBe(401);
  });

  it('rejects with 401 for an invalid token', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('http://localhost/api/stats/route/42', 'bad-token'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when the position does not exist, even for an authenticated caller', async () => {
    const { GET } = await loadRoute({ positionExists: false });
    const res = await GET(req('http://localhost/api/stats/route/999', 'valid-token'));
    expect(res.status).toBe(404);
  });

  it("rejects with 403 when the position belongs to a different company than the caller's", async () => {
    const { GET } = await loadRoute({ positionCompanyId: 200 });
    const res = await GET(req('http://localhost/api/stats/route/42', 'valid-token'));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Access denied');
  });

  it("returns candidate stats when the position belongs to the caller's own company", async () => {
    const { GET } = await loadRoute({ positionCompanyId: CALLER_COMPANY_ID });
    const res = await GET(req('http://localhost/api/stats/route/42', 'valid-token'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.candidates).toEqual([{ candidat_id: 1, candidat_score: 8 }]);
  });
});
