import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../helpers/supabaseMock';
import { requestWithAuth } from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/interviews/route';
const EMAIL_SERVICE_PATH = '../../lib/email-service';
const I18N_PATH = '../../src/i18n/server-translations';

const MEMBER_USER_ID = 'member-uuid';
const CALLER_COMPANY_ID = 100;
const OTHER_COMPANY_ID = 200;

async function loadRoute(opts: { positionCompanyId?: number; existingInterviewPositionId?: number } = {}) {
  vi.resetModules();
  const positionCompanyId = opts.positionCompanyId ?? CALLER_COMPANY_ID;

  vi.doMock(EMAIL_SERVICE_PATH, () => ({ sendInterviewInvitation: vi.fn(), sendInterviewCancellation: vi.fn() }));
  vi.doMock(I18N_PATH, () => ({ getServerTranslation: () => (k: string) => k }));

  const client = createSupabaseMock({
    auth: (token: string) =>
      token === 'member-token' ? { data: { user: { id: MEMBER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    tables: {
      company_to_users: (state) => {
        const targetCompany = state.filters['company_id'];
        if (targetCompany !== undefined && targetCompany !== CALLER_COMPANY_ID) return { data: null, error: new Error('not found') };
        return { data: { company_id: CALLER_COMPANY_ID }, error: null };
      },
      openedpositions: (state) => {
        // GET filters openedpositions by company_id directly (.eq('company_id', ...)
        // .maybeSingle()); POST/PATCH instead fetch the position's own company_id
        // (no company_id filter here) and compare it via requireCompanyMember
        // separately. Only branch on the filter when GET's query actually sets it.
        const companyFilter = state.filters['company_id'];
        if (companyFilter !== undefined && companyFilter !== positionCompanyId) {
          return { data: null, error: null };
        }
        return { data: { company_id: positionCompanyId }, error: null };
      },
      position_to_candidat: (state) => {
        if (state.method === 'select') return { data: [{ position_id: 42 }], error: null };
        return { data: null, error: null };
      },
      interviews: (state) => {
        if (state.method === 'select') return { data: { position_id: 42 }, error: null };
        if (state.method === 'insert') return { data: { id: 7, position_id: state.payload }, error: null };
        return { data: { id: 5, status: state.payload }, error: null };
      },
      candidats: () => ({ data: { candidat_email: 'a@x.com', candidat_firstname: 'Jane', candidat_lastname: 'Doe' }, error: null }),
      users: () => ({ data: { user_firstname: 'Rec', user_lastname: 'Ruiter' }, error: null }),
    },
  });
  (client as any).auth.admin = { getUserById: vi.fn(async () => ({ data: { user: { email: 'rec@x.com' } }, error: null })) };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  return import(ROUTE_PATH);
}

describe('GET /api/interviews', () => {
  beforeEach(() => vi.resetModules());

  it('returns [] with no candidat_id (unchanged behavior)', async () => {
    const { GET } = await loadRoute();
    const res = await GET(new Request('http://localhost/api/interviews'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('rejects with 401 when no auth header is present (previously: any candidat_id leaked its full interview list)', async () => {
    const { GET } = await loadRoute();
    const res = await GET(new Request('http://localhost/api/interviews?candidat_id=1'));
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when the candidate's position belongs to a different company (cross-tenant attempt)", async () => {
    const { GET } = await loadRoute({ positionCompanyId: OTHER_COMPANY_ID });
    const res = await GET(requestWithAuth('http://localhost/api/interviews?candidat_id=1', {}, 'member-token'));
    expect(res.status).toBe(403);
  });

  it("returns the interview list when the candidate's position belongs to the caller's own company", async () => {
    const { GET } = await loadRoute();
    const res = await GET(requestWithAuth('http://localhost/api/interviews?candidat_id=1', {}, 'member-token'));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/interviews', () => {
  beforeEach(() => vi.resetModules());

  function req(token?: string) {
    return requestWithAuth(
      'http://localhost/api/interviews',
      { method: 'POST', body: JSON.stringify({ position_id: 42, candidat_id: 1, recruiter_id: MEMBER_USER_ID, interview_datetime: '2026-01-01T10:00:00Z' }) },
      token
    );
  }

  it('rejects with 401 when no auth header is present (previously: any position_id/candidat_id/recruiter_id was accepted)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when the position belongs to a different company (cross-tenant attempt)", async () => {
    const { POST } = await loadRoute({ positionCompanyId: OTHER_COMPANY_ID });
    const res = await POST(req('member-token'));
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/interviews', () => {
  beforeEach(() => vi.resetModules());

  function req(token?: string) {
    return requestWithAuth('http://localhost/api/interviews', { method: 'PATCH', body: JSON.stringify({ id: 5, status: 'confirmed' }) }, token);
  }

  it('rejects with 401 when no auth header is present (previously: any interview id could be updated/cancelled)', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req());
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when the interview's position belongs to a different company (cross-tenant attempt)", async () => {
    const { PATCH } = await loadRoute({ positionCompanyId: OTHER_COMPANY_ID });
    const res = await PATCH(req('member-token'));
    expect(res.status).toBe(403);
  });

  it("updates the interview when its position belongs to the caller's own company", async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req('member-token'));
    expect(res.status).toBe(200);
  });
});
