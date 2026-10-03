import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/interview-assistant/route';
const PROMPTS_PATH = '../../lib/prompts';

const MEMBER_USER_ID = 'member-uuid';
const CALLER_COMPANY_ID = 100;
const OTHER_COMPANY_ID = 200;

async function loadRoute(opts: { positionCompanyId?: number } = {}) {
  vi.resetModules();
  const positionCompanyId = opts.positionCompanyId ?? CALLER_COMPANY_ID;

  vi.doMock(PROMPTS_PATH, () => ({
    getPrompts: vi.fn(async () => ({ interview_questions_generation: 'template' })),
    fillPromptVariables: vi.fn((t: string) => t),
    PromptNotFoundError: class extends Error {},
    PromptDatabaseError: class extends Error {},
  }));

  global.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content: '{"questions": ["Q1"]}' } }] }),
  })) as unknown as typeof fetch;

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'member-token' ? { data: { user: { id: MEMBER_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
    from: (table: string) => {
      if (table === 'openedpositions') {
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: positionCompanyId }, error: null }) }) }) };
      }
      if (table === 'company_to_users') {
        return {
          select: () => {
            const state: { companyId?: number } = {};
            const chain: any = {
              eq: (col: string, val: unknown) => {
                if (col === 'company_id') state.companyId = val as number;
                return chain;
              },
              single: async () => {
                if (state.companyId !== undefined && state.companyId !== CALLER_COMPANY_ID) {
                  return { data: null, error: new Error('not found') };
                }
                return { data: { company_id: CALLER_COMPANY_ID }, error: null };
              },
            };
            return chain;
          },
        };
      }
      if (table === 'candidats')
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { cv_text: 'cv', candidat_firstname: 'Jane', candidat_lastname: 'Doe' }, error: null }) }) }) };
      if (table === 'position_to_candidat')
        return { select: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: { candidat_next_step: 2 }, error: null }) }) }) }) };
      if (table === 'recruitment_steps')
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { step_name: 'Interview 1' }, error: null }) }) }) };
      if (table === 'interviews') return { update: () => ({ eq: async () => ({ data: null, error: null }) }) };
      throw new Error(`unexpected table ${table}`);
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, body: unknown = { mode: 'questions', candidat_id: 1, position_id: 42, interview_id: 7 }) {
  return requestWithAuth('http://localhost/api/interview-assistant', { method: 'POST', body: JSON.stringify(body) }, token);
}

describe('POST /api/interview-assistant', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: any candidat_id/position_id/interview_id was accepted, zero auth)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when the position belongs to a different company than the caller's (cross-tenant attempt)", async () => {
    const { POST } = await loadRoute({ positionCompanyId: OTHER_COMPANY_ID });
    const res = await POST(req('member-token'));
    expect(res.status).toBe(403);
  });

  it("generates interview questions when the position belongs to the caller's own company", async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('member-token'));
    expect(res.status).toBe(200);
  });
});
