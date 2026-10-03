import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/medical-certificates/confirm/route';
const ENTITLEMENTS_PATH = '../../../lib/entitlements';

const ADMIN_USER_ID = 'admin-uuid';
const CALLER_COMPANY_ID = 100;

let insertedCompanyId: number | undefined;
let uploadPath: string | undefined;

async function loadRoute(opts: { entitled?: boolean } = {}) {
  vi.resetModules();
  const entitled = opts.entitled ?? true;
  insertedCompanyId = undefined;
  uploadPath = undefined;

  vi.doMock(ENTITLEMENTS_PATH, () => ({
    hasFeatureAccess: vi.fn(async () => (entitled ? { allowed: true } : { allowed: false, reason: 'plan_limit_reached' })),
    entitlementErrorBody: () => ({ error: 'not entitled' }),
  }));

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'admin-token' ? { data: { user: { id: ADMIN_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
    from: (table: string) => {
      if (table === 'users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { is_admin: true, is_super_admin: false }, error: null }) }) }) };
      if (table === 'company_to_users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: CALLER_COMPANY_ID }, error: null }) }) }) };
      if (table === 'medical_certificates') {
        return {
          insert: (payload: [{ company_id: number }]) => {
            insertedCompanyId = payload[0].company_id;
            return { select: () => Promise.resolve({ data: [{ id: 1 }], error: null }) };
          },
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
    storage: {
      from: (_bucket: string) => ({
        upload: async (path: string, _buf: unknown, _opts: unknown) => {
          uploadPath = path;
          return { data: { path }, error: null };
        },
        createSignedUrl: async (path: string, _exp: number) => ({ data: { signedUrl: `https://signed/${path}` }, error: null }),
      }),
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, companyIdField: string | null = '999') {
  const form = new FormData();
  form.set('employee_name', 'Jane Doe');
  form.set('file', new File(['x'], 'cert.pdf', { type: 'application/pdf' }));
  if (companyIdField !== null) form.set('company_id', companyIdField);
  return requestWithAuth('http://localhost/api/medical-certificates/confirm', { method: 'POST', body: form }, token);
}

describe('POST /api/medical-certificates/confirm', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: entitlement check only, no identity check for sensitive health data)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it("ignores an attacker-supplied company_id in the form and only ever files the certificate under the caller's own company", async () => {
    const { POST } = await loadRoute();
    await POST(req('admin-token', '999'));
    expect(insertedCompanyId).toBe(CALLER_COMPANY_ID);
    expect(uploadPath).toContain(`certificates/${CALLER_COMPANY_ID}/`);
  });

  it('saves the certificate for an authenticated admin of the entitled company', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('admin-token'));
    expect(res.status).toBe(200);
  });

  it('rejects with 403 when the admin\'s own company is not entitled', async () => {
    const { POST } = await loadRoute({ entitled: false });
    const res = await POST(req('admin-token'));
    expect(res.status).toBe(403);
  });
});
