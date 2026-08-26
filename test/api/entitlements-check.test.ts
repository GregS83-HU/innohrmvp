import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/entitlements/check/route';
const ENTITLEMENTS_PATH = '../../lib/entitlements';

const CALLER_USER_ID = 'caller-uuid';
const CALLER_COMPANY_ID = 100;
const VICTIM_COMPANY_ID = 999;

let checkedCompanyId: unknown;

async function loadRoute() {
  vi.resetModules();
  checkedCompanyId = undefined;

  vi.doMock(ENTITLEMENTS_PATH, () => ({
    resolveCompanyIdForUser: vi.fn(async () => CALLER_COMPANY_ID),
    hasFeatureAccess: vi.fn(async (companyId: unknown) => {
      checkedCompanyId = companyId;
      return { allowed: true, plan: 'momentum' };
    }),
  }));

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'caller-token' ? { data: { user: { id: CALLER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, companyIdParam = VICTIM_COMPANY_ID.toString()) {
  return requestWithAuth(
    `http://localhost/api/entitlements/check?company_id=${companyIdParam}&feature=medicalCertificates.upload`,
    {},
    token
  );
}

describe('GET /api/entitlements/check', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: any company_id query param worked, no session check)', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("ignores an attacker-supplied company_id query param and only ever checks the caller's own company", async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('caller-token', VICTIM_COMPANY_ID.toString()));
    expect(res.status).toBe(200);
    expect(checkedCompanyId).toBe(CALLER_COMPANY_ID);
  });
});
