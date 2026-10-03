import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, writesTo } from '../helpers/supabaseMock';
import { jsonRequest } from '../helpers/authFixtures';

let client: ReturnType<typeof createSupabaseMock>;

async function load(path: string) {
  vi.resetModules();
  client = createSupabaseMock({
    tables: {
      contact_submissions: () => ({ data: { id: 1 } }),
      demo_feedback: () => ({ data: [{ id: 1 }] }),
    },
  });
  mockSupabaseJs(client);
  return import(path);
}

const CONTACT = { firstName: 'Ada', lastName: 'Lovelace', email: 'Ada@Acme.TEST', companyName: 'Acme', gdprConsent: true, comment: 'x'.repeat(1500) };
const contact = (body: Record<string, unknown>, ip = '1.2.3.4') => jsonRequest('http://localhost/api/contact', 'POST', body, undefined, { 'x-forwarded-for': ip });

describe('POST /api/contact (lead capture)', () => {
  beforeEach(() => vi.resetModules());

  it('requires GDPR consent and the mandatory fields', async () => {
    const { POST } = await load('../../src/app/api/contact/route');
    expect((await POST(contact({ ...CONTACT, gdprConsent: false }))).status).toBe(400);
    expect((await POST(contact({ ...CONTACT, companyName: '' }))).status).toBe(400);
  });

  it('validates email and phone', async () => {
    const { POST } = await load('../../src/app/api/contact/route');
    expect((await POST(contact({ ...CONTACT, email: 'nope' }))).status).toBe(400);
    expect((await POST(contact({ ...CONTACT, phone: 'abc' }))).status).toBe(400);
  });

  it('stores a sanitized submission (lower-cased email, 1000-char cap, status new)', async () => {
    const { POST } = await load('../../src/app/api/contact/route');
    const res = await POST(contact(CONTACT));
    expect(res.status).toBe(200);
    const [row] = writesTo(client, 'contact_submissions')[0].payload as Record<string, unknown>[];
    expect(row).toMatchObject({ email: 'ada@acme.test', status: 'new', gdpr_consent: true, marketing_consent: false, ip_address: '1.2.3.4' });
    expect((row.comment as string).length).toBe(1000);
  });

  it('rate-limits to 3 submissions per IP+email per window', async () => {
    const { POST } = await load('../../src/app/api/contact/route');
    for (let i = 0; i < 3; i++) expect((await POST(contact(CONTACT, '9.9.9.9'))).status).toBe(200);
    expect((await POST(contact(CONTACT, '9.9.9.9'))).status).toBe(429);
    expect((await POST(contact(CONTACT, '8.8.8.8'))).status).toBe(200);
  });
});

describe('POST /api/feedback (demo star rating)', () => {
  beforeEach(() => vi.resetModules());

  it.each([0, 6, undefined])('rejects rating %s', async (rating) => {
    const { POST } = await load('../../src/app/api/feedback/route');
    expect((await POST(jsonRequest('http://localhost/api/feedback', 'POST', { rating }))).status).toBe(400);
  });

  it('stores a 1-5 rating with comment', async () => {
    const { POST } = await load('../../src/app/api/feedback/route');
    const res = await POST(jsonRequest('http://localhost/api/feedback', 'POST', { rating: 4, comment: 'nice' }));
    expect(res.status).toBe(201);
    expect(writesTo(client, 'demo_feedback')[0].payload).toMatchObject({ rating: 4, comment: 'nice' });
  });
});
