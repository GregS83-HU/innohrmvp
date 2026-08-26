import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../helpers/supabaseMock';
import { superAdminAuthHandler, usersTableHandler, requestWithAuth, VALID_SUPER_ADMIN_TOKEN, VALID_REGULAR_TOKEN } from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/import-users/route';
const ENTITLEMENTS_PATH = '../../lib/entitlements';
const CONFIG_ENTITLEMENTS_PATH = '../../src/config/entitlements';

async function loadRoute() {
  vi.resetModules();
  const client = createSupabaseMock({
    auth: superAdminAuthHandler,
    tables: {
      users: (state) => {
        // Distinguish the auth-check lookup (eq('id', <uuid>)) from the
        // bulk-created-user insert (insert with a fresh id) by method.
        if (state.method === 'select') return usersTableHandler()(state);
        return { data: null, error: null };
      },
      company_to_users: () => ({ data: null, error: null }),
    },
  });
  vi.doMock('@supabase/supabase-js', () => ({
    createClient: () => ({
      ...client,
      auth: {
        ...client.auth,
        admin: {
          createUser: vi.fn(async () => ({ data: { user: { id: 'new-user-id' } }, error: null })),
          generateLink: vi.fn(async () => ({ data: null, error: null })),
        },
      },
    }),
  }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
  vi.doMock(ENTITLEMENTS_PATH, () => ({ hasFeatureAccess: vi.fn(async () => ({ allowed: true })) }));
  vi.doMock(CONFIG_ENTITLEMENTS_PATH, () => ({ getAddEmployeeLimitMessage: () => 'limit reached' }));
  return import(ROUTE_PATH);
}

function req(token?: string) {
  const form = new FormData();
  form.set('file', new File(['email,company_id\ntest@x.com,1'], 'users.csv', { type: 'text/csv' }));
  return requestWithAuth('http://localhost/api/import-users', { method: 'POST', body: form }, token);
}

describe('POST /api/import-users', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 403 when no auth token is present (previously: anyone could bulk-create users, including admins, in any company)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(403);
  });

  it('rejects with 403 when the caller is authenticated but not a super admin', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req(VALID_REGULAR_TOKEN));
    expect(res.status).toBe(403);
  });

  it('allows the import for an authenticated super admin', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req(VALID_SUPER_ADMIN_TOKEN));
    expect(res.status).toBe(200);
  });
});
