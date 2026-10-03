// AUTHZ-12 / PUB-03 / PUB-04: smaller service-role routes that used to trust
// whoever called them.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, mockEmptyCookies, writesTo } from '../helpers/supabaseMock';
import { personaAuth, personaTables, jsonRequest, PERSONAS, type PersonaName } from '../helpers/authFixtures';

let client: ReturnType<typeof createSupabaseMock>;

async function load(path: string) {
  vi.resetModules();
  client = createSupabaseMock({
    auth: personaAuth,
    tables: {
      ...personaTables(),
      demo_feedback: () => ({ data: [{ id: 1, rating: 5, ip_address: '1.2.3.4' }] }),
      contact_submissions: () => ({ data: null }),
    },
    rpc: (name) => {
      if (name === 'get_recruitment_steps_for_user') return { data: [{ id: 1, name: 'Screening' }] };
      if (name === 'get_company_candidates') return { data: [{ id: 1 }, { id: 2 }, { id: 3 }] };
      return { data: null };
    },
  });
  mockSupabaseJs(client);
  mockEmptyCookies();
  return import(path);
}

describe('GET /api/feedback (demo feedback list)', () => {
  beforeEach(() => vi.resetModules());
  const ROUTE = '../../src/app/api/feedback/route';
  const list = (persona?: PersonaName) => jsonRequest('http://localhost/api/feedback', 'GET', undefined, persona);

  it('refuses anonymous callers and company admins', async () => {
    const { GET } = await load(ROUTE);
    expect((await GET(list())).status).toBe(403);
    expect((await GET(list('admin'))).status).toBe(403);
    expect(client.calls.some((c) => c.table === 'demo_feedback')).toBe(false);
  });

  it('lists feedback for a super admin', async () => {
    const { GET } = await load(ROUTE);
    const res = await GET(list('superAdmin'));
    expect(res.status).toBe(200);
    expect((await res.json()).data).toHaveLength(1);
  });
});

describe.each([
  ['recruitment-step', 'get_recruitment_steps_for_user'],
  ['candidate-count', 'get_company_candidates'],
])('GET /api/%s', (route, rpcName) => {
  beforeEach(() => vi.resetModules());
  const ROUTE = `../../src/app/api/${route}/route`;
  const get = (userId: string, persona?: PersonaName) =>
    jsonRequest(`http://localhost/api/${route}?user_id=${userId}`, 'GET', undefined, persona);

  it('401 for an anonymous caller', async () => {
    const { GET } = await load(ROUTE);
    expect((await GET(get(PERSONAS.employee.id))).status).toBe(401);
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("403 when reading another user's data, even a same-company admin", async () => {
    const { GET } = await load(ROUTE);
    expect((await GET(get(PERSONAS.employee.id, 'admin'))).status).toBe(403);
    expect((await GET(get(PERSONAS.employee.id, 'otherAdmin'))).status).toBe(403);
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it('serves the caller their own data', async () => {
    const { GET } = await load(ROUTE);
    const res = await GET(get(PERSONAS.manager.id, 'manager'));
    expect(res.status).toBe(200);
    const [name, args] = client.rpc.mock.calls[0] as [string, Record<string, unknown>];
    expect(name).toBe(rpcName);
    expect(Object.values(args)).toEqual([PERSONAS.manager.id]);
  });
});

describe('GET /api/candidate-count response', () => {
  it('returns the count of company candidates', async () => {
    const { GET } = await load('../../src/app/api/candidate-count/route');
    const res = await GET(jsonRequest(`http://localhost/api/candidate-count?user_id=${PERSONAS.admin.id}`, 'GET', undefined, 'admin'));
    expect(await res.json()).toEqual({ count: 3 });
  });
});

describe('POST /api/notifications/email', () => {
  beforeEach(() => vi.resetModules());
  const ROUTE = '../../src/app/api/notifications/email/route';
  const BODY = {
    type: 'new_ticket',
    recipientEmail: 'someone@test.local',
    companySlug: 'acme',
    ticketData: { id: 't1', title: 'Broken', user_email: 'u@test.local', user_name: 'U', priority: 'high', description: 'd' },
  };

  it('401 for an anonymous caller', async () => {
    const { POST } = await load(ROUTE);
    expect((await POST(jsonRequest('http://localhost/api/notifications/email', 'POST', BODY))).status).toBe(401);
  });

  it('accepts an authenticated company member', async () => {
    const { POST } = await load(ROUTE);
    const res = await POST(jsonRequest('http://localhost/api/notifications/email', 'POST', BODY, 'employee'));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/unsubscribe', () => {
  beforeEach(() => vi.resetModules());
  const ROUTE = '../../src/app/api/unsubscribe/route';
  const unsub = (body: Record<string, unknown>) => jsonRequest('http://localhost/api/unsubscribe', 'POST', body);

  it('403 without a token or with a token minted for another address', async () => {
    const { POST } = await load(ROUTE);
    const { signEmailToken } = await import('../../lib/authz');
    expect((await POST(unsub({ email: 'victim@test.local' }))).status).toBe(403);
    expect((await POST(unsub({ email: 'victim@test.local', token: 'deadbeef' }))).status).toBe(403);
    const otherToken = signEmailToken('attacker@test.local', 'UNSUBSCRIBE_SECRET');
    expect((await POST(unsub({ email: 'victim@test.local', token: otherToken }))).status).toBe(403);
    expect(writesTo(client, 'contact_submissions')).toEqual([]);
  });

  it('unsubscribes exactly the signed address (case-insensitive)', async () => {
    const { POST } = await load(ROUTE);
    const { signEmailToken } = await import('../../lib/authz');
    const token = signEmailToken('ada@acme.test', 'UNSUBSCRIBE_SECRET');
    const res = await POST(unsub({ email: 'Ada@Acme.TEST', token }));
    expect(res.status).toBe(200);
    const [write] = writesTo(client, 'contact_submissions');
    expect(write.filters).toEqual({ email: 'ada@acme.test' });
    expect(write.payload).toMatchObject({ marketing_consent: false });
  });

  it('fails closed when UNSUBSCRIBE_SECRET is unset', async () => {
    const { POST } = await load(ROUTE);
    const { signEmailToken } = await import('../../lib/authz');
    const token = signEmailToken('ada@acme.test', 'UNSUBSCRIBE_SECRET');
    const saved = process.env.UNSUBSCRIBE_SECRET;
    delete process.env.UNSUBSCRIBE_SECRET;
    try {
      expect((await POST(unsub({ email: 'ada@acme.test', token }))).status).toBe(403);
    } finally {
      process.env.UNSUBSCRIBE_SECRET = saved;
    }
  });
});
