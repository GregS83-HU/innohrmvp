import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSupabaseMock } from '../../helpers/supabaseMock';

const ROUTE_PATH = '../../../src/app/api/happiness/session/route';

async function loadRoute(opts: { session?: Record<string, unknown> | null } = {}) {
  vi.resetModules();
  const session = opts.session === undefined ? { id: 1, session_token: 'valid-tok', timeout_at: '2999-01-01T00:00:00Z' } : opts.session;
  let updateCalled = false;
  const client = createSupabaseMock({
    tables: {
      happiness_sessions: (state) => {
        if (state.method === 'update') {
          updateCalled = true;
          return { data: null, error: null };
        }
        return session ? { data: session, error: null } : { data: null, error: new Error('not found') };
      },
    },
  });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  return { ...(await import(ROUTE_PATH)), wasUpdateCalled: () => updateCalled };
}

function req(token?: string) {
  const headers = new Headers();
  if (token) headers.set('x-session-token', token);
  return new NextRequest('http://localhost/api/happiness/session', { headers });
}

describe('GET /api/happiness/session', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no session token header is present', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Token session requis');
  });

  it('rejects with 404 when the session token does not match any session', async () => {
    const { GET } = await loadRoute({ session: null });
    const res = await GET(req('unknown-tok'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Session non trouvée');
  });

  it('returns 410 and marks the session timed out when it has expired', async () => {
    const { GET, wasUpdateCalled } = await loadRoute({
      session: { id: 1, session_token: 'expired-tok', timeout_at: '2000-01-01T00:00:00Z' },
    });
    const res = await GET(req('expired-tok'));
    expect(res.status).toBe(410);
    expect(wasUpdateCalled()).toBe(true);
  });

  it('returns the session for a valid, unexpired token', async () => {
    const { GET } = await loadRoute();
    const res = await GET(req('valid-tok'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.session.session_token).toBe('valid-tok');
  });
});
