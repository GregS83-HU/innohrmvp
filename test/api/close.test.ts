import { describe, it, expect, vi, beforeEach } from 'vitest';

const ROUTE_PATH = '../../src/app/api/close/route';
const SERVER_CLIENT_PATH = '../../lib/supabaseServerClient';

const CALLER_USER_ID = 'caller-uuid';
const CALLER_COMPANY_ID = 100;

async function loadRoute(opts: {
  authenticated?: boolean;
  positionExists?: boolean;
  positionCompanyId?: number;
} = {}) {
  vi.resetModules();
  const authenticated = opts.authenticated ?? true;
  const positionExists = opts.positionExists ?? true;
  const positionCompanyId = opts.positionCompanyId ?? CALLER_COMPANY_ID;
  let updateCalled = false;

  const fakeClient = {
    auth: {
      getUser: async () =>
        authenticated ? { data: { user: { id: CALLER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('no session') },
    },
    from: (table: string) => {
      if (table === 'openedpositions') {
        return {
          select: (_cols?: string) => ({
            eq: (_col: string, _val: unknown) => ({
              single: async () =>
                positionExists ? { data: { company_id: positionCompanyId }, error: null } : { data: null, error: new Error('not found') },
            }),
          }),
          update: (_payload: unknown) => ({
            eq: (_col: string, _val: unknown) => ({
              select: async () => {
                updateCalled = true;
                return { data: [{ id: 1 }], error: null };
              },
            }),
          }),
        };
      }
      if (table === 'company_to_users') {
        return {
          select: (_cols?: string) => ({
            eq: (_col: string, _val: unknown) => ({
              eq: (_col2: string, targetCompanyId: unknown) => ({
                single: async () =>
                  targetCompanyId === CALLER_COMPANY_ID
                    ? { data: { company_id: CALLER_COMPANY_ID }, error: null }
                    : { data: null, error: new Error('not found') },
              }),
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

function req(positionId?: unknown) {
  return new Request('http://localhost/api/close', { method: 'POST', body: JSON.stringify({ positionId }) });
}

describe('POST /api/close', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 400 when positionId is missing', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req(undefined));
    expect(res.status).toBe(400);
  });

  it('closes the position when it belongs to the caller\'s own company', async () => {
    const { POST, wasUpdateCalled } = await loadRoute({ positionCompanyId: CALLER_COMPANY_ID });
    const res = await POST(req(42));
    expect(res.status).toBe(200);
    expect(wasUpdateCalled()).toBe(true);
  });

  it('rejects with 404 when the position does not exist', async () => {
    const { POST, wasUpdateCalled } = await loadRoute({ positionExists: false });
    const res = await POST(req(999));
    expect(res.status).toBe(404);
    expect(wasUpdateCalled()).toBe(false);
  });

  it('rejects with 403 (new: previously a silent 200 no-op left entirely to RLS) when the position belongs to a different company', async () => {
    const { POST, wasUpdateCalled } = await loadRoute({ positionCompanyId: 200 });
    const res = await POST(req(42));
    expect(res.status).toBe(403);
    expect(wasUpdateCalled()).toBe(false);
  });
});
