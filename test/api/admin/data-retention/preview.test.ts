import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../../../helpers/supabaseMock';
import {
  superAdminAuthHandler,
  usersTableHandler,
  requestWithAuth,
  VALID_SUPER_ADMIN_TOKEN,
  VALID_REGULAR_TOKEN,
} from '../../../helpers/authFixtures';

const ROUTE_PATH = '../../../../src/app/api/admin/data-retention/preview/route';
const DATA_RETENTION_PATH = '../../../../lib/dataRetention';
const PREVIEW_FIXTURE = [{ dataType: 'medical_certificate', count: 3 }];

async function loadRoute() {
  vi.resetModules();
  const client = createSupabaseMock({ auth: superAdminAuthHandler, tables: { users: usersTableHandler() } });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
  vi.doMock(DATA_RETENTION_PATH, () => ({ previewDeletions: vi.fn(async () => PREVIEW_FIXTURE) }));
  return import(ROUTE_PATH);
}

describe('GET /api/admin/data-retention/preview', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('rejects with 403 when no auth token is present', async () => {
    const { GET } = await loadRoute();
    const res = await GET(requestWithAuth('http://localhost/api/admin/data-retention/preview'));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('No authentication token found');
  });

  it('rejects with 403 when caller is authenticated but not a super admin', async () => {
    const { GET } = await loadRoute();
    const res = await GET(
      requestWithAuth('http://localhost/api/admin/data-retention/preview', {}, VALID_REGULAR_TOKEN)
    );
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('User is not authorized. Super admin access required.');
  });

  it('returns the preview for an authenticated super admin', async () => {
    const { GET } = await loadRoute();
    const res = await GET(
      requestWithAuth('http://localhost/api/admin/data-retention/preview', {}, VALID_SUPER_ADMIN_TOKEN)
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.preview).toEqual(PREVIEW_FIXTURE);
  });
});
