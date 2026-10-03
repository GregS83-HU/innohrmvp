import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../../helpers/supabaseMock';
import {
  superAdminAuthHandler,
  usersTableHandler,
  requestWithAuth,
  VALID_SUPER_ADMIN_TOKEN,
  VALID_REGULAR_TOKEN,
} from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/admin/onboarding/route';
const COMPANIES_FIXTURE = [{ id: 1, company_name: 'Acme', slug: 'acme', onboarding_completed: false }];

let funnelInsertMock: (payload: unknown) => void;

async function loadRoute() {
  vi.resetModules();
  funnelInsertMock = vi.fn();
  const client = createSupabaseMock({
    auth: superAdminAuthHandler,
    tables: {
      users: usersTableHandler(),
      company: (state) => {
        if (state.method === 'select') return { data: COMPANIES_FIXTURE, error: null };
        if (state.method === 'update') {
          const payload = state.payload as { onboarding_completed?: boolean };
          return {
            data: { id: state.filters['id'], company_name: 'Acme', slug: 'acme', onboarding_completed: payload?.onboarding_completed },
            error: null,
          };
        }
        return { data: null, error: null };
      },
      funnel_events: (state) => {
        funnelInsertMock(state.payload);
        return { data: null, error: null };
      },
    },
  });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
  return import(ROUTE_PATH);
}

function req(method: 'GET' | 'PATCH', token?: string, body?: unknown) {
  return requestWithAuth(
    'http://localhost/api/admin/onboarding',
    { method, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) },
    token
  );
}

describe('GET /api/admin/onboarding', () => {
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

  it('returns companies for a super admin', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('GET', VALID_SUPER_ADMIN_TOKEN));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.companies).toEqual(COMPANIES_FIXTURE);
  });
});

describe('PATCH /api/admin/onboarding', () => {
  beforeEach(() => vi.resetModules());
  const validBody = { company_id: 1, onboarding_completed: true };

  it('rejects with 403 when no auth token is present', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req('PATCH', undefined, validBody));
    expect(res.status).toBe(403);
  });

  it('rejects with 403 when caller is not a super admin', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req('PATCH', VALID_REGULAR_TOKEN, validBody));
    expect(res.status).toBe(403);
    expect(funnelInsertMock).not.toHaveBeenCalled();
  });

  it('updates onboarding status and logs a funnel event for a super admin', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(req('PATCH', VALID_SUPER_ADMIN_TOKEN, validBody));
    expect(res.status).toBe(200);
    expect(funnelInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'onboarding_marked_complete' })
    );
  });
});
