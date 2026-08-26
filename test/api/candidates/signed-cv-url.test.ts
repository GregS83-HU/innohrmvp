import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../../helpers/supabaseMock';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/candidates/signed-cv-url/route';

const CALLER_USER_ID = 'caller-uuid';
const CALLER_COMPANY_ID = 100;
const OTHER_COMPANY_ID = 200;
// candidate 1 belongs to the caller's own company; candidate 2 belongs to a
// different company entirely — this is the cross-company negative case.
const CANDIDATE_COMPANY: Record<number, number> = { 1: CALLER_COMPANY_ID, 2: OTHER_COMPANY_ID };

async function loadRoute(opts: { hasMembership?: boolean } = {}) {
  vi.resetModules();
  const hasMembership = opts.hasMembership ?? true;
  const client = createSupabaseMock({
    auth: (token: string) => {
      if (token === 'valid-token') return { data: { user: { id: CALLER_USER_ID } }, error: null };
      return { data: { user: null }, error: new Error('invalid token') };
    },
    tables: {
      company_to_users: () =>
        hasMembership
          ? { data: { company_id: CALLER_COMPANY_ID }, error: null }
          : { data: null, error: new Error('not found') },
      position_to_candidat: (state) => {
        const inIds = (state.filters['candidat_id'] as { in: number[] } | undefined)?.in ?? [];
        const targetCompany = state.filters['openedpositions.company_id'];
        const rows = inIds
          .filter((id) => CANDIDATE_COMPANY[id] === targetCompany)
          .map((id) => ({ candidat_id: id }));
        return { data: rows, error: null };
      },
      candidats: (state) => {
        const inIds = (state.filters['id'] as { in: number[] } | undefined)?.in ?? [];
        return { data: inIds.map((id) => ({ id, cv_file: `cvs/${id}.pdf` })), error: null };
      },
    },
    storage: (bucket, path) => ({ data: { signedUrl: `https://signed.example/${bucket}/${path}` }, error: null }),
  });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  return import(ROUTE_PATH);
}

function req(token?: string, candidateIds: number[] = [1, 2]) {
  return requestWithAuth(
    'http://localhost/api/candidates/signed-cv-url',
    { method: 'POST', body: JSON.stringify({ candidate_ids: candidateIds }) },
    token
  );
}

describe('POST /api/candidates/signed-cv-url', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it('rejects with 401 for an invalid token', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('bad-token'));
    expect(res.status).toBe(401);
  });

  it('rejects with 403 when the caller has no company membership', async () => {
    const { POST } = await loadRoute({ hasMembership: false });
    const res = await POST(req('valid-token'));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('No company associated with your account');
  });

  it('returns 400 for a missing candidate_ids body even when the caller has no company membership (validates body before membership)', async () => {
    const { POST } = await loadRoute({ hasMembership: false });
    const res = await POST(req('valid-token', []));
    expect(res.status).toBe(400);
  });

  it('returns a signed URL only for the candidate in the caller\'s own company, not the other company\'s candidate', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('valid-token', [1, 2]));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Object.keys(body.urls)).toEqual(['1']);
    expect(body.urls[1]).toContain('cvs/1.pdf');
    expect(body.urls[2]).toBeUndefined();
  });
});
