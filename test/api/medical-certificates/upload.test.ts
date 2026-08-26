import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWithAuth } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/medical-certificates/upload/route';
const ENTITLEMENTS_PATH = '../../../lib/entitlements';
const PROMPTS_PATH = '../../../lib/prompts';

const ADMIN_USER_ID = 'admin-uuid';
const CALLER_COMPANY_ID = 100;

let uploadPath: string | undefined;

async function loadRoute() {
  vi.resetModules();
  uploadPath = undefined;

  process.env.OCRSPACE_API_KEY = 'test-ocr-key';
  process.env.OPENROUTER_API_KEY = 'test-openrouter-key';

  vi.doMock(ENTITLEMENTS_PATH, () => ({
    hasFeatureAccess: vi.fn(async () => ({ allowed: true })),
    entitlementErrorBody: () => ({ error: 'not entitled' }),
  }));
  vi.doMock(PROMPTS_PATH, () => ({
    getPrompt: vi.fn(async () => 'template {{rawText}}'),
    fillPromptVariables: vi.fn((template: string) => template),
    PromptNotFoundError: class extends Error {},
    PromptDatabaseError: class extends Error {},
  }));

  global.fetch = vi.fn(async (url: string) => {
    if (url.includes('ocr.space')) {
      return { ok: true, json: async () => ({ OCRExitCode: 1, ParsedResults: [{ ParsedText: 'Jane Doe, sick 2026-01-01 to 2026-01-05' }] }) } as Response;
    }
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"employee_name":"Jane Doe"}' } }] }) } as Response;
  }) as unknown as typeof fetch;

  const fakeSupabase = {
    auth: {
      getUser: async (token: string) =>
        token === 'admin-token' ? { data: { user: { id: ADMIN_USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid') },
    },
    from: (table: string) => {
      if (table === 'users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { is_admin: true, is_super_admin: false }, error: null }) }) }) };
      if (table === 'company_to_users') return { select: () => ({ eq: () => ({ single: async () => ({ data: { company_id: CALLER_COMPANY_ID }, error: null }) }) }) };
      throw new Error(`unexpected table ${table}`);
    },
    storage: {
      from: (_bucket: string) => ({
        upload: async (path: string) => {
          uploadPath = path;
          return { data: { path }, error: null };
        },
        createSignedUrl: async (path: string) => ({ data: { signedUrl: `https://signed/${path}` }, error: null }),
      }),
    },
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => fakeSupabase }));
  return import(ROUTE_PATH);
}

function req(token?: string, companyIdField: string | null = '999') {
  const form = new FormData();
  form.set('file', new File(['x'], 'cert.pdf', { type: 'application/pdf' }));
  if (companyIdField !== null) form.set('company_id', companyIdField);
  return requestWithAuth('http://localhost/api/medical-certificates/upload', { method: 'POST', body: form }, token);
}

describe('POST /api/medical-certificates/upload', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present (previously: entitlement check only, no identity check for sensitive health data)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it("ignores an attacker-supplied company_id in the form and only ever uploads under the caller's own company", async () => {
    const { POST } = await loadRoute();
    await POST(req('admin-token', '999'));
    expect(uploadPath).toContain(`uploads/${CALLER_COMPANY_ID}/`);
  });

  it('runs OCR/extraction for an authenticated admin of the entitled company', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('admin-token'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.company_id).toBe(CALLER_COMPANY_ID);
  });
});
