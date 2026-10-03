// Behavioural proof of open findings listed in KNOWN_GAPS
// (test/guards/route-auth-inventory.test.ts). Each test asserts the CORRECT
// behaviour and is marked `.fails` because the product doesn't do it yet -
// the suite stays green, and the test turns red the day the gap is fixed so
// the `.fails` marker (and the KNOWN_GAPS entry) get removed with the fix.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs } from '../helpers/supabaseMock';
import { jsonRequest } from '../helpers/authFixtures';

let consumeCredit: ReturnType<typeof vi.fn>;

async function load(path: string) {
  vi.resetModules();
  consumeCredit = vi.fn(async () => false);
  vi.doMock('../../lib/credit', () => ({ consumeCredit }));
  mockSupabaseJs(createSupabaseMock({ tables: { demo_feedback: () => ({ data: [{ id: 1, rating: 5, ip_address: '1.2.3.4' }] }) } }));
  return import(path);
}

describe('Known security gaps (tracked, not yet fixed)', () => {
  beforeEach(() => vi.resetModules());

  it.fails("KNOWN GAP: an anonymous caller cannot spend another company's AI credits via job-description generation", async () => {
    const { POST } = await load('../../src/app/api/generate-position-description/route');
    const res = await POST(jsonRequest('http://localhost/api/generate-position-description', 'POST', { roughDraft: 'x'.repeat(40), positionName: 'Dev', companyId: 999 }));
    expect(consumeCredit).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
  });

  it.fails('KNOWN GAP: demo feedback (with IP addresses) is not publicly listable', async () => {
    const { GET } = await load('../../src/app/api/feedback/route');
    const res = await GET(jsonRequest('http://localhost/api/feedback', 'GET'));
    expect(res.status).toBe(401);
  });
});
