import { describe, it, expect, vi, beforeEach } from 'vitest';

const ROUTE_PATH = '../../src/app/api/update-comment/route';
const SERVER_CLIENT_PATH = '../../lib/supabaseServerClient';

const CALLER_USER_ID = 'caller-uuid';
const CALLER_COMPANY_ID = 100;
// candidate 1 has a position link in the caller's company; candidate 2 only
// has a position link in a different company.
const CANDIDATE_LINKED_COMPANY: Record<number, number> = { 1: CALLER_COMPANY_ID, 2: 200 };

async function loadRoute(opts: { authenticated?: boolean; hasMembership?: boolean } = {}) {
  vi.resetModules();
  const authenticated = opts.authenticated ?? true;
  const hasMembership = opts.hasMembership ?? true;
  let updateCalled = false;

  const fakeClient = {
    auth: {
      getUser: async () =>
        authenticated ? { data: { user: { id: CALLER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('no session') },
    },
    from: (table: string) => {
      if (table === 'position_to_candidat') {
        return {
          select: (_cols?: string) => {
            const state = { filters: {} as Record<string, unknown> };
            const builder: any = {
              eq(col: string, val: unknown) {
                state.filters[col] = val;
                return builder;
              },
              then(resolve: any) {
                const candidatId = state.filters['candidat_id'] as number;
                const targetCompany = state.filters['openedpositions.company_id'];
                const rows = CANDIDATE_LINKED_COMPANY[candidatId] === targetCompany ? [{ candidat_id: candidatId }] : [];
                return resolve({ data: rows, error: null });
              },
            };
            return builder;
          },
          update: (_payload: unknown) => ({
            eq: (_col: string, _val: unknown) => {
              updateCalled = true;
              return Promise.resolve({ data: null, error: null });
            },
          }),
        };
      }
      if (table === 'company_to_users') {
        return {
          select: (_cols?: string) => ({
            eq: (_col: string, _val: unknown) => ({
              single: async () =>
                hasMembership ? { data: { company_id: CALLER_COMPANY_ID }, error: null } : { data: null, error: new Error('not found') },
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };

  vi.doMock(SERVER_CLIENT_PATH, () => ({ createServerClient: () => fakeClient }));
  return { ...(await import(ROUTE_PATH)), wasUpdateCalled: () => updateCalled };
}

function req(candidat_id?: unknown, comment = 'a comment') {
  return new Request('http://localhost/api/update-comment', { method: 'POST', body: JSON.stringify({ candidat_id, comment }) });
}

describe('POST /api/update-comment', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 400 when candidat_id is missing', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req(undefined));
    expect(res.status).toBe(400);
  });

  it('updates the comment when the candidate is linked to a position in the caller\'s own company', async () => {
    const { POST, wasUpdateCalled } = await loadRoute();
    const res = await POST(req(1));
    expect(res.status).toBe(200);
    expect(wasUpdateCalled()).toBe(true);
  });

  it('rejects with 401 when there is no session', async () => {
    const { POST, wasUpdateCalled } = await loadRoute({ authenticated: false });
    const res = await POST(req(1));
    expect(res.status).toBe(401);
    expect(wasUpdateCalled()).toBe(false);
  });

  it('rejects with 403 when the caller has no company membership', async () => {
    const { POST, wasUpdateCalled } = await loadRoute({ hasMembership: false });
    const res = await POST(req(1));
    expect(res.status).toBe(403);
    expect(wasUpdateCalled()).toBe(false);
  });

  it('rejects with 403 (new: previously a silent 200 no-op left entirely to RLS) when the candidate is only linked to a different company\'s position', async () => {
    const { POST, wasUpdateCalled } = await loadRoute();
    const res = await POST(req(2));
    expect(res.status).toBe(403);
    expect(wasUpdateCalled()).toBe(false);
  });
});
