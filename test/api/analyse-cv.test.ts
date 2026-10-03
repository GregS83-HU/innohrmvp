import { describe, it, expect, vi, beforeEach } from 'vitest';

const ROUTE_PATH = '../../src/app/api/analyse-cv/route';
const PARSE_PDF_PATH = '../../lib/parsePdfSafe';
const CREDIT_PATH = '../../lib/credit';
const PROMPTS_PATH = '../../lib/prompts';

const POSITION_COMPANY_ID = 100;
const OTHER_COMPANY_ID = 999; // the mismatched companySlug an attacker/candidate might send

let consumeCreditMock: ReturnType<typeof vi.fn>;
let insertedRelationPositionId: unknown;

async function loadRoute(opts: { positionExists?: boolean } = {}) {
  vi.resetModules();
  const positionExists = opts.positionExists ?? true;
  insertedRelationPositionId = undefined;

  vi.doMock(PARSE_PDF_PATH, () => ({ default: vi.fn(async () => 'Full CV text content') }));
  consumeCreditMock = vi.fn(async () => true);
  vi.doMock(CREDIT_PATH, () => ({ consumeCredit: consumeCreditMock }));
  vi.doMock(PROMPTS_PATH, () => ({
    getPrompt: vi.fn(async () => 'template'),
    fillPromptVariables: vi.fn((t: string) => t),
    PromptNotFoundError: class extends Error {},
    PromptDatabaseError: class extends Error {},
  }));

  global.fetch = vi.fn(async () => ({
    ok: true,
    text: async () =>
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 8,
                analysis: 'good fit',
                candidateFeedback: 'nice',
                candidat_firstname: 'Jane',
                candidat_lastname: 'Doe',
                candidat_email: 'jane@x.com',
                candidat_phone: '123',
              }),
            },
          },
        ],
      }),
  })) as unknown as typeof fetch;

  const fakeSupabase = {
    from: (table: string) => {
      if (table === 'openedpositions') {
        return {
          select: () => ({
            eq: () => ({
              single: async () =>
                positionExists
                  ? { data: { position_name: 'Engineer', company_id: POSITION_COMPANY_ID, manager_id: null }, error: null }
                  : { data: null, error: new Error('not found') },
            }),
          }),
        };
      }
      if (table === 'candidats') {
        return { insert: () => ({ select: () => ({ single: async () => ({ data: { id: 42 }, error: null }) }) }) };
      }
      if (table === 'position_to_candidat') {
        return {
          insert: (payload: { position_id: unknown }) => {
            insertedRelationPositionId = payload.position_id;
            return Promise.resolve({ error: null });
          },
        };
      }
      if (table === 'company_to_users') {
        return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) };
      }
      throw new Error(`unexpected table ${table}`);
    },
    storage: { from: () => ({ upload: async () => ({ data: {}, error: null }) }) },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(positionId: string, companySlug = 'a-different-company') {
  const form = new FormData();
  form.set('file', new File(['%PDF-1.4'], 'cv.pdf', { type: 'application/pdf' }));
  form.set('jobDescription', 'We need an engineer');
  form.set('positionId', positionId);
  form.set('companySlug', companySlug);
  return new Request('http://localhost/api/analyse-cv', { method: 'POST', body: form });
}

describe('POST /api/analyse-cv', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 404 for a nonexistent positionId (previously: no validation at all, a candidate/relation row was still created)', async () => {
    const { POST } = await loadRoute({ positionExists: false });
    const res = await POST(req('999999'));
    expect(res.status).toBe(404);
    expect(consumeCreditMock).not.toHaveBeenCalled();
  });

  it("bills AI credits against the position's own company, ignoring a mismatched companySlug", async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('42', 'a-different-company'));
    expect(res.status).toBe(200);
    expect(consumeCreditMock).toHaveBeenCalledWith(POSITION_COMPANY_ID);
    expect(consumeCreditMock).not.toHaveBeenCalledWith(OTHER_COMPANY_ID);
    expect(insertedRelationPositionId).toBe('42');
  });
});
