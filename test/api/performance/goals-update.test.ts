import { describe, it, expect, vi, beforeEach } from 'vitest';

const ROUTE_PATH = '../../../src/app/api/performance/goals/update/route';
const ENTITLEMENTS_PATH = '../../../lib/entitlements';

let orFilterUsed: string | undefined;

async function loadRoute(opts: { entitled?: boolean; matches?: boolean } = {}) {
  vi.resetModules();
  orFilterUsed = undefined;
  const entitled = opts.entitled ?? true;
  const matches = opts.matches ?? true;

  vi.doMock(ENTITLEMENTS_PATH, () => ({
    resolveCompanyIdForUser: vi.fn(async () => 1),
    hasFeatureAccess: vi.fn(async () => (entitled ? { allowed: true } : { allowed: false, reason: 'not_entitled' })),
    entitlementErrorBody: (feature: string, result: unknown) => ({ error: 'not entitled', feature, result }),
  }));

  const fakeSupabase = {
    from: (_table: string) => ({
      update: (_payload: unknown) => ({
        eq: (_col: string, _val: unknown) => ({
          or: (expr: string) => {
            orFilterUsed = expr;
            return {
              select: async () => (matches ? { data: [{ id: 1, goal_title: 'Updated' }], error: null } : { data: [], error: null }),
            };
          },
        }),
      }),
    }),
  };
  vi.doMock('@supabase/ssr', () => ({ createServerClient: () => fakeSupabase }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }));

  return import(ROUTE_PATH);
}

function patchReq(body: unknown) {
  return new Request('http://localhost/api/performance/goals/update', { method: 'PATCH', body: JSON.stringify(body) });
}

describe('PATCH /api/performance/goals/update', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 400 when goal_id is missing', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(patchReq({ user_id: 'u1' }));
    expect(res.status).toBe(400);
  });

  it('rejects with 403 when the resolved company is not entitled', async () => {
    const { PATCH } = await loadRoute({ entitled: false });
    const res = await PATCH(patchReq({ goal_id: 1, user_id: 'u1', status: 'active' }));
    expect(res.status).toBe(403);
  });

  it('builds an employee-or-manager row filter using the supplied user_id', async () => {
    const { PATCH } = await loadRoute();
    await PATCH(patchReq({ goal_id: 1, user_id: 'u1', status: 'active' }));
    expect(orFilterUsed).toBe('employee_id.eq.u1,manager_id.eq.u1');
  });

  it('returns 404 when no row matches the owner-or-manager filter', async () => {
    const { PATCH } = await loadRoute({ matches: false });
    const res = await PATCH(patchReq({ goal_id: 1, user_id: 'u1', status: 'active' }));
    expect(res.status).toBe(404);
  });

  it('returns the updated goal when a row matches', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(patchReq({ goal_id: 1, user_id: 'u1', status: 'active' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.goal).toEqual({ id: 1, goal_title: 'Updated' });
  });
});
