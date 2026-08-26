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

const ROUTE_PATH = '../../../../src/app/api/admin/data-retention/settings/route';
const DATA_RETENTION_PATH = '../../../../lib/dataRetention';
const SETTINGS_FIXTURE = [{ data_type: 'medical_certificate', retention_days: 90 }];
const HISTORY_FIXTURE = [{ data_type: 'medical_certificate', retention_days: 90, changed_at: '2026-01-01' }];

let updateRetentionSettingMock: ReturnType<typeof vi.fn>;

async function loadRoute() {
  vi.resetModules();
  const client = createSupabaseMock({ auth: superAdminAuthHandler, tables: { users: usersTableHandler() } });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
  updateRetentionSettingMock = vi.fn(async () => undefined);
  vi.doMock(DATA_RETENTION_PATH, () => ({
    getRetentionSettings: vi.fn(async () => SETTINGS_FIXTURE),
    getRetentionHistory: vi.fn(async () => HISTORY_FIXTURE),
    updateRetentionSetting: updateRetentionSettingMock,
  }));
  return import(ROUTE_PATH);
}

function req(method: 'GET' | 'PATCH', token?: string, body?: unknown) {
  return requestWithAuth(
    'http://localhost/api/admin/data-retention/settings',
    { method, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) },
    token
  );
}

describe('GET /api/admin/data-retention/settings', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 403 when no auth token is present', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('GET'));
    expect(res.status).toBe(403);
  });

  it('rejects with 403 when caller is not a super admin', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('GET', VALID_REGULAR_TOKEN));
    expect(res.status).toBe(403);
  });

  it('returns settings and history for a super admin', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('GET', VALID_SUPER_ADMIN_TOKEN));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.settings).toEqual(SETTINGS_FIXTURE);
    expect(body.history).toEqual(HISTORY_FIXTURE);
  });
});

describe('PATCH /api/admin/data-retention/settings', () => {
  beforeEach(() => vi.resetModules());

  const validBody = { data_type: 'medical_certificate', retention_days: 60 };

  it('rejects with 403 when no auth token is present', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req('PATCH', undefined, validBody));
    expect(res.status).toBe(403);
  });

  it('rejects with 403 when caller is not a super admin', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req('PATCH', VALID_REGULAR_TOKEN, validBody));
    expect(res.status).toBe(403);
    expect(updateRetentionSettingMock).not.toHaveBeenCalled();
  });

  it('updates the setting for a super admin, attributing it to that admin', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req('PATCH', VALID_SUPER_ADMIN_TOKEN, validBody));
    expect(res.status).toBe(200);
    expect(updateRetentionSettingMock).toHaveBeenCalledWith('medical_certificate', 60, SUPER_ADMIN_USER_ID);
  });
});
