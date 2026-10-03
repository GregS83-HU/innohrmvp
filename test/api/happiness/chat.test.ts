import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSupabaseMock } from '../../helpers/supabaseMock';

const ROUTE_PATH = '../../../src/app/api/happiness/chat/route';

async function loadRoute(opts: { session?: Record<string, unknown> | null } = {}) {
  vi.resetModules();
  const session =
    opts.session === undefined
      ? { id: 5, session_token: 'valid-tok', timeout_at: null, status: 'in_progress', current_step: 0, perma_scores: null }
      : opts.session;
  let sessionUpdateCalled = false;
  let chatInsertCalled = false;
  const client = createSupabaseMock({
    tables: {
      happiness_sessions: (state) => {
        if (state.method === 'update') {
          sessionUpdateCalled = true;
          return { data: null, error: null };
        }
        return session ? { data: session, error: null } : { data: null, error: new Error('not found') };
      },
      chat_messages: (state) => {
        if (state.method === 'insert') {
          chatInsertCalled = true;
        }
        return { data: null, error: null };
      },
    },
  });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  return {
    ...(await import(ROUTE_PATH)),
    wasSessionUpdateCalled: () => sessionUpdateCalled,
    wasChatInsertCalled: () => chatInsertCalled,
  };
}

function req(token?: string, message = 'hello') {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (token) headers.set('x-session-token', token);
  return new NextRequest('http://localhost/api/happiness/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  });
}

describe('POST /api/happiness/chat', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no session token header is present', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Missing session token');
  });

  it('rejects with 404 when the session token does not match any session', async () => {
    const { POST } = await loadRoute({ session: null });
    const res = await POST(req('unknown-tok'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Session not found');
  });

  it('rejects with 410 and marks the session timed out when it has expired', async () => {
    const { POST, wasSessionUpdateCalled } = await loadRoute({
      session: { id: 5, session_token: 'expired-tok', timeout_at: '2000-01-01T00:00:00Z', status: 'in_progress', current_step: 0 },
    });
    const res = await POST(req('expired-tok'));
    expect(res.status).toBe(410);
    expect(wasSessionUpdateCalled()).toBe(true);
  });

  it('rejects with 400 when the assessment is already completed', async () => {
    const { POST } = await loadRoute({
      session: { id: 5, session_token: 'done-tok', timeout_at: null, status: 'completed', current_step: 12 },
    });
    const res = await POST(req('done-tok'));
    expect(res.status).toBe(400);
  });

  it('advances the conversation for a valid, in-progress session', async () => {
    const { POST, wasSessionUpdateCalled, wasChatInsertCalled } = await loadRoute();
    const res = await POST(req('valid-tok'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.step).toBe(1);
    expect(body.completed).toBe(false);
    expect(typeof body.response).toBe('string');
    expect(wasSessionUpdateCalled()).toBe(true);
    expect(wasChatInsertCalled()).toBe(true);
  });
});
