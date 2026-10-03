// Behavioural proof of open findings listed in KNOWN_GAPS
// (test/guards/route-auth-inventory.test.ts). Write each test for the CORRECT
// behaviour and mark it `it.fails` while the product doesn't do it yet - the
// suite stays green, and the test turns red the day the gap is fixed so the
// `.fails` marker (and the KNOWN_GAPS entry) get removed with the fix.
//
// No gaps are open today. The tests below are regressions for gaps that were
// closed (AUTHZ-12, PUB-03); full coverage lives in ai-credit-routes.test.ts
// and service-role-routes.test.ts.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, mockEmptyCookies } from '../helpers/supabaseMock';
import { jsonRequest, personaAuth, personaTables } from '../helpers/authFixtures';

let consumeCredit: ReturnType<typeof vi.fn>;

async function load(path: string) {
  vi.resetModules();
  consumeCredit = vi.fn(async () => false);
  vi.doMock('../../lib/credit', () => ({ consumeCredit }));
  mockSupabaseJs(
    createSupabaseMock({
      auth: personaAuth,
      tables: { ...personaTables(), demo_feedback: () => ({ data: [{ id: 1, rating: 5, ip_address: '1.2.3.4' }] }) },
    })
  );
  mockEmptyCookies();
  return import(path);
}

describe('Closed security gaps (regression)', () => {
  beforeEach(() => vi.resetModules());

  it("an anonymous caller cannot spend another company's AI credits via job-description generation", async () => {
    const { POST } = await load('../../src/app/api/generate-position-description/route');
    const res = await POST(jsonRequest('http://localhost/api/generate-position-description', 'POST', { roughDraft: 'x'.repeat(40), positionName: 'Dev', companyId: 999 }));
    expect(consumeCredit).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
  });

  it('demo feedback (with IP addresses) is not publicly listable', async () => {
    const { GET } = await load('../../src/app/api/feedback/route');
    const res = await GET(jsonRequest('http://localhost/api/feedback', 'GET'));
    expect(res.status).toBe(403);
  });
});
