import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../../helpers/supabaseMock';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/medical-certificates/signed-url/route';

const ADMIN_USER_ID = 'admin-uuid';
const NON_ADMIN_USER_ID = 'non-admin-uuid';
const CALLER_COMPANY_ID = 100;
const OTHER_COMPANY_ID = 200;
const CERT_COMPANY: Record<number, number> = { 1: CALLER_COMPANY_ID, 2: OTHER_COMPANY_ID };

async function loadRoute(opts: { hasMembership?: boolean } = {}) {
  vi.resetModules();
  const hasMembership = opts.hasMembership ?? true;
  const client = createSupabaseMock({
    auth: (token: string) => {
      if (token === 'admin-token') return { data: { user: { id: ADMIN_USER_ID } }, error: null };
      if (token === 'non-admin-token') return { data: { user: { id: NON_ADMIN_USER_ID } }, error: null };
      return { data: { user: null }, error: new Error('invalid token') };
    },
    tables: {
      users: (state) => {
        const id = state.filters['id'];
        if (id === ADMIN_USER_ID) return { data: { is_admin: true, is_super_admin: false }, error: null };
        if (id === NON_ADMIN_USER_ID) return { data: { is_admin: false, is_super_admin: false }, error: null };
        return { data: null, error: new Error('not found') };
      },
      company_to_users: () =>
        hasMembership
          ? { data: { company_id: CALLER_COMPANY_ID }, error: null }
          : { data: null, error: new Error('not found') },
      medical_certificates: (state) => {
        const inIds = (state.filters['id'] as { in: number[] } | undefined)?.in ?? [];
        const targetCompany = state.filters['company_id'];
        const rows = inIds
          .filter((id) => CERT_COMPANY[id] === targetCompany)
          .map((id) => ({ id, certificate_file: `certs/${id}.pdf` }));
        return { data: rows, error: null };
      },
    },
    storage: (bucket, path) => ({ data: { signedUrl: `https://signed.example/${bucket}/${path}` }, error: null }),
  });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  return import(ROUTE_PATH);
}

function req(token?: string, certificateIds: number[] = [1, 2]) {
  return requestWithAuth(
    'http://localhost/api/medical-certificates/signed-url',
    { method: 'POST', body: JSON.stringify({ certificate_ids: certificateIds }) },
    token
  );
}

describe('POST /api/medical-certificates/signed-url', () => {
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

  it('returns 400 for missing certificate_ids even for a non-admin (validates body before role)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('non-admin-token', []));
    expect(res.status).toBe(400);
  });

  it('rejects with 403 when caller is authenticated but not an admin', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('non-admin-token'));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Access denied');
  });

  it('rejects with 403 when the admin caller has no company membership', async () => {
    const { POST } = await loadRoute({ hasMembership: false });
    const res = await POST(req('admin-token'));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('No company associated with your account');
  });

  it("returns a signed URL only for the certificate in the admin's own company, not the other company's certificate", async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('admin-token', [1, 2]));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Object.keys(body.urls)).toEqual(['1']);
    expect(body.urls[2]).toBeUndefined();
  });
});
