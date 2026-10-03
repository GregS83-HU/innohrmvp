// AUTHZ-12 / POS-07 / CV-05: the two recruiter-side AI routes that spend
// company credits. The company is always derived from the caller's session,
// never from the request.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, writesTo } from '../helpers/supabaseMock';
import { personaAuth, personaTables, jsonRequest, PERSONAS, COMPANY_A, COMPANY_B, type PersonaName } from '../helpers/authFixtures';

const POSITION_A = 1;
const POSITION_B = 2;

let client: ReturnType<typeof createSupabaseMock>;
let consumeCredit: ReturnType<typeof vi.fn>;

async function load(path: string, opts: { credits?: boolean } = {}) {
  vi.resetModules();
  consumeCredit = vi.fn(async () => opts.credits ?? true);
  vi.doMock('../../lib/credit', () => ({ consumeCredit }));
  vi.doMock('../../lib/prompts', () => ({
    getPrompt: vi.fn(async () => 'template'),
    fillPromptVariables: vi.fn((t: string) => t),
    PromptNotFoundError: class extends Error {},
    PromptDatabaseError: class extends Error {},
  }));
  global.fetch = vi.fn(async () => {
    const body = JSON.stringify({ choices: [{ message: { content: JSON.stringify({ score: 8, analysis: 'fit' }) } }] });
    return new Response(body, { status: 200 });
  }) as unknown as typeof fetch;

  client = createSupabaseMock({
    auth: personaAuth,
    tables: {
      ...personaTables(),
      openedpositions: (s) => {
        const id = s.filters['id'];
        if (id === POSITION_A) return { data: { id, company_id: COMPANY_A, position_description: 'd', position_description_detailed: 'dd' } };
        if (id === POSITION_B) return { data: { id, company_id: COMPANY_B, position_description: 'd', position_description_detailed: 'dd' } };
        return { data: null, error: new Error('not found') };
      },
      position_to_candidat: () => ({ data: null }),
    },
    rpc: (name) => (name === 'get_company_candidates' ? { data: [{ id: 11, cv_text: 'cv one' }, { id: 12, cv_text: 'cv two' }] } : { data: null }),
  });
  mockSupabaseJs(client);
  return import(path);
}

describe('POST /api/generate-position-description', () => {
  beforeEach(() => vi.resetModules());
  const ROUTE = '../../src/app/api/generate-position-description/route';
  const gen = (body: Record<string, unknown>, persona?: PersonaName) =>
    jsonRequest('http://localhost/api/generate-position-description', 'POST', body, persona);
  const DRAFT = { roughDraft: 'x'.repeat(40), positionName: 'Dev' };

  it('401 for an anonymous caller, no credit spent', async () => {
    const { POST } = await load(ROUTE);
    const res = await POST(gen({ ...DRAFT, companyId: COMPANY_A }));
    expect(res.status).toBe(401);
    expect(consumeCredit).not.toHaveBeenCalled();
  });

  it("bills the caller's own company and ignores a client-supplied companyId", async () => {
    const { POST } = await load(ROUTE);
    await POST(gen({ ...DRAFT, companyId: COMPANY_B }, 'manager'));
    expect(consumeCredit).toHaveBeenCalledTimes(1);
    expect(consumeCredit).toHaveBeenCalledWith(String(COMPANY_A));
  });

  it('402 when the company is out of credits', async () => {
    const { POST } = await load(ROUTE, { credits: false });
    expect((await POST(gen(DRAFT, 'employee'))).status).toBe(402);
  });

  it('400 on a too-short draft, before any credit is spent', async () => {
    const { POST } = await load(ROUTE);
    expect((await POST(gen({ roughDraft: 'short' }, 'admin'))).status).toBe(400);
    expect(consumeCredit).not.toHaveBeenCalled();
  });
});

describe('GET /api/analyse-massive', () => {
  beforeEach(() => vi.resetModules());
  const ROUTE = '../../src/app/api/analyse-massive/route';
  const run = (query: string, persona?: PersonaName) =>
    jsonRequest(`http://localhost/api/analyse-massive?${query}`, 'GET', undefined, persona);

  it('401 for an anonymous caller, even with ids in the query', async () => {
    const { GET } = await load(ROUTE);
    const res = await GET(run(`position_id=${POSITION_A}&user_id=${PERSONAS.admin.id}&company_id=${COMPANY_A}`));
    expect(res.status).toBe(401);
    expect(consumeCredit).not.toHaveBeenCalled();
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("404 for another company's position: no credit spent, no scores rewritten", async () => {
    const { GET } = await load(ROUTE);
    const res = await GET(run(`position_id=${POSITION_B}&company_id=${COMPANY_B}`, 'admin'));
    expect(res.status).toBe(404);
    expect(consumeCredit).not.toHaveBeenCalled();
    expect(client.rpc).not.toHaveBeenCalled();
    expect(writesTo(client, 'position_to_candidat')).toEqual([]);
  });

  it('404 for an unknown position', async () => {
    const { GET } = await load(ROUTE);
    expect((await GET(run('position_id=12345', 'admin'))).status).toBe(404);
  });

  it("scores the caller's own candidates, one credit per CV billed to the caller's company", async () => {
    const { GET } = await load(ROUTE);
    const res = await GET(run(`position_id=${POSITION_A}&user_id=${PERSONAS.otherAdmin.id}&company_id=${COMPANY_B}`, 'manager'));
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('"type":"done","matched":2,"total":2');

    expect(client.rpc).toHaveBeenCalledWith('get_company_candidates', { user_uuid: PERSONAS.manager.id });
    expect(consumeCredit).toHaveBeenCalledTimes(2);
    expect(consumeCredit.mock.calls.every(([c]) => c === String(COMPANY_A))).toBe(true);
    expect(writesTo(client, 'position_to_candidat').map((w) => w.payload)).toEqual([
      expect.objectContaining({ position_id: POSITION_A, candidat_id: 11, candidat_score: 8 }),
      expect.objectContaining({ position_id: POSITION_A, candidat_id: 12, candidat_score: 8 }),
    ]);
  });

  it('stops when credits run out', async () => {
    const { GET } = await load(ROUTE, { credits: false });
    const text = await (await GET(run(`position_id=${POSITION_A}`, 'admin'))).text();
    expect(text).toContain('"type":"error"');
    expect(writesTo(client, 'position_to_candidat')).toEqual([]);
  });
});
