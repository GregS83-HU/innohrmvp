import { describe, it, expect, vi, beforeEach } from 'vitest';

const ROUTE_PATH = '../../src/app/api/company-email-settings/route';
const AUTH_HELPERS_PATH = '@supabase/auth-helpers-nextjs';

const ADMIN_USER_ID = 'admin-uuid';
const CALLER_COMPANY_ID = 100;

let upsertTarget: number | undefined;

async function loadRoute(opts: { authenticated?: boolean; isAdmin?: boolean } = {}) {
  vi.resetModules();
  const authenticated = opts.authenticated ?? true;
  const isAdmin = opts.isAdmin ?? true;
  upsertTarget = undefined;

  const fakeSupabase = {
    auth: {
      getUser: async () =>
        authenticated ? { data: { user: { id: ADMIN_USER_ID } }, error: null } : { data: { user: null }, error: new Error('no session') },
    },
    from: (table: string) => {
      if (table === 'company_to_users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: CALLER_COMPANY_ID }, error: null }) }) }) };
      if (table === 'users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { is_admin: isAdmin, is_super_admin: false }, error: null }) }) }) };
      if (table === 'company_email_settings') {
        return {
          select: (_cols?: string) => ({
            eq: (_c: string, id: number) => {
              upsertTarget = id;
              return { single: async () => ({ data: { id: 1, company_id: id, smtp_host: 'smtp.example.com' }, error: null }) };
            },
          }),
          delete: () => ({
            eq: async (_c: string, id: number) => {
              upsertTarget = id;
              return { data: null, error: null };
            },
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock(AUTH_HELPERS_PATH, () => ({ createServerComponentClient: () => fakeSupabase }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
  return import(ROUTE_PATH);
}

function getReq(companyIdParam = '999') {
  return new Request(`http://localhost/api/company-email-settings?company_id=${companyIdParam}`);
}
function deleteReq(companyIdParam = '999') {
  return new Request(`http://localhost/api/company-email-settings?company_id=${companyIdParam}`, { method: 'DELETE' });
}

describe('GET /api/company-email-settings', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when there is no session (previously: zero auth at all on any method)', async () => {
    const { GET } = await loadRoute({ authenticated: false });
    const res = await GET(getReq());
    expect(res.status).toBe(401);
  });

  it('rejects with 403 when the caller is authenticated but not an admin', async () => {
    const { GET } = await loadRoute({ isAdmin: false });
    const res = await GET(getReq());
    expect(res.status).toBe(403);
  });

  it("ignores an attacker-supplied company_id query param and only ever reads the caller's own company", async () => {
    const { GET } = await loadRoute();
    await GET(getReq('999'));
    expect(upsertTarget).toBe(CALLER_COMPANY_ID);
  });
});

describe('DELETE /api/company-email-settings', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when there is no session', async () => {
    const { DELETE } = await loadRoute({ authenticated: false });
    const res = await DELETE(deleteReq());
    expect(res.status).toBe(401);
    expect(upsertTarget).toBeUndefined();
  });

  it("ignores an attacker-supplied company_id and only ever deletes the caller's own company's settings", async () => {
    const { DELETE } = await loadRoute();
    await DELETE(deleteReq('999'));
    expect(upsertTarget).toBe(CALLER_COMPANY_ID);
  });
});
