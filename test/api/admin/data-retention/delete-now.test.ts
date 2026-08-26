import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../../../helpers/supabaseMock';
import {
  superAdminAuthHandler,
  usersTableHandler,
  requestWithAuth,
  SUPER_ADMIN_USER_ID,
  VALID_SUPER_ADMIN_TOKEN,
  VALID_REGULAR_TOKEN,
} from '../../../helpers/authFixtures';

const ROUTE_PATH = '../../../../src/app/api/admin/data-retention/delete-now/route';
const DATA_RETENTION_PATH = '../../../../lib/dataRetention';

let deleteRecordNowMock: ReturnType<typeof vi.fn>;

async function loadRoute() {
  vi.resetModules();
  const client = createSupabaseMock({ auth: superAdminAuthHandler, tables: { users: usersTableHandler() } });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
  deleteRecordNowMock = vi.fn(async () => 1);
  vi.doMock(DATA_RETENTION_PATH, () => ({ deleteRecordNow: deleteRecordNowMock }));
  return import(ROUTE_PATH);
}

function postRequest(token?: string, body?: unknown) {
  return requestWithAuth(
    'http://localhost/api/admin/data-retention/delete-now',
    { method: 'POST', body: JSON.stringify(body ?? { data_type: 'medical_certificate', record_id: 42 }) },
    token
  );
}

describe('POST /api/admin/data-retention/delete-now', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('rejects with 403 when no auth token is present', async () => {
    const { POST } = await loadRoute();
    const res = await POST(postRequest());
    expect(res.status).toBe(403);
  });

  it('rejects with 403 when caller is authenticated but not a super admin', async () => {
    const { POST } = await loadRoute();
    const res = await POST(postRequest(VALID_REGULAR_TOKEN));
    expect(res.status).toBe(403);
    expect(deleteRecordNowMock).not.toHaveBeenCalled();
  });

  it('deletes the record for an authenticated super admin, attributing it to that admin', async () => {
    const { POST } = await loadRoute();
    const res = await POST(postRequest(VALID_SUPER_ADMIN_TOKEN));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, deleted: 1 });
    expect(deleteRecordNowMock).toHaveBeenCalledWith('medical_certificate', 42, SUPER_ADMIN_USER_ID);
  });

  it('rejects invalid data_type with 400 even for a super admin', async () => {
    const { POST } = await loadRoute();
    const res = await POST(postRequest(VALID_SUPER_ADMIN_TOKEN, { data_type: 'not_a_real_type', record_id: 1 }));
    expect(res.status).toBe(400);
  });
});
