import { describe, it, expect, vi, beforeEach } from 'vitest';

const ROUTE_PATH = '../../src/app/api/interview-conclude/route';

let updateCalled = false;

async function loadRoute(opts: { linked?: boolean } = {}) {
  vi.resetModules();
  const linked = opts.linked ?? true;
  updateCalled = false;

  global.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content: '{"score": 8, "summary": "Great candidate"}' } }] }),
  })) as unknown as typeof fetch;

  const fakeSupabase = {
    from: (table: string) => {
      if (table === 'position_to_candidat') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: async () => (linked ? { data: { candidat_id: 1 }, error: null } : { data: null, error: new Error('not linked') }),
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              eq: async () => {
                updateCalled = true;
                return { error: null };
              },
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(candidateId: unknown = 1, positionId: unknown = 42) {
  return new Request('http://localhost/api/interview-conclude', {
    method: 'POST',
    body: JSON.stringify({
      conversationHistory: [{ role: 'interviewer', content: 'Hi' }],
      candidateId,
      positionId,
      cvText: 'cv',
      jobDescription: 'jd',
      positionName: 'Engineer',
    }),
  });
}

describe('POST /api/interview-conclude', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 404 when the candidate is not actually linked to the position (previously: any candidateId/positionId pair was accepted)', async () => {
    const { POST } = await loadRoute({ linked: false });
    const res = await POST(req());
    expect(res.status).toBe(404);
    expect(updateCalled).toBe(false);
  });

  it('saves the interview score/summary when the candidate is genuinely linked to the position', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(200);
    expect(updateCalled).toBe(true);
  });
});
