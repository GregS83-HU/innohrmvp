import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, writesTo } from '../helpers/supabaseMock';
import { jsonRequest } from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/signup/route';

let client: ReturnType<typeof createSupabaseMock>;
let sendEmail: ReturnType<typeof vi.fn>;

const VALID = { companyName: 'Acme Kft.', adminFirstName: 'Ada', adminLastName: 'Lovelace', email: 'ada@acme.test', password: 'longenough' };

async function loadRoute(opts: { takenSlugs?: string[]; failOn?: 'company' | 'users' | 'company_to_users' | 'user_profiles'; emailFails?: boolean } = {}) {
  vi.resetModules();
  sendEmail = vi.fn(async () => {
    if (opts.emailFails) throw new Error('smtp down');
    return { success: true };
  });
  vi.doMock('../../lib/email-service', () => ({ sendOnboardingBookingEmail: sendEmail }));
  const fail = (t: string) => (opts.failOn === t ? { error: { message: `${t} failed` } } : {});
  client = createSupabaseMock({
    tables: {
      company: (s) => {
        if (s.method === 'select') return { data: (opts.takenSlugs ?? []).includes(s.filters['slug'] as string) ? { id: 1 } : null };
        if (s.method === 'insert') return opts.failOn === 'company' ? { data: null, ...fail('company') } : { data: { id: 100, slug: (s.payload as { slug: string }).slug } };
        return {};
      },
      users: (s) => (s.method === 'insert' ? fail('users') : {}),
      company_to_users: (s) => (s.method === 'insert' ? fail('company_to_users') : {}),
      user_profiles: (s) => (s.method === 'insert' ? fail('user_profiles') : {}),
      funnel_events: () => ({}),
    },
  });
  mockSupabaseJs(client);
  return import(ROUTE_PATH);
}

const post = (body: Record<string, unknown>) => jsonRequest('http://localhost/api/signup', 'POST', body);

describe('POST /api/signup (self-serve company creation)', () => {
  beforeEach(() => vi.resetModules());

  it.each([
    [{ companyName: '  ' }, /Company name/],
    [{ adminLastName: '' }, /First and last name/],
    [{ email: 'not-an-email' }, /valid email/],
    [{ password: 'short' }, /at least 8/],
  ])('rejects invalid input %o', async (override, msg) => {
    const { POST } = await loadRoute();
    const res = await POST(post({ ...VALID, ...override }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(msg);
    expect(client.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it('creates company on Free with onboarding incomplete, an admin user, membership and profile', async () => {
    const { POST } = await loadRoute();
    const res = await POST(post(VALID));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, slug: 'acme-kft' });

    expect(client.auth.admin.createUser).toHaveBeenCalledWith({ email: VALID.email, password: VALID.password, email_confirm: true });
    const [companyInsert] = writesTo(client, 'company').filter((w) => w.method === 'insert');
    expect(companyInsert.payload).toEqual({ company_name: 'Acme Kft.', slug: 'acme-kft', forfait: null, onboarding_completed: false });
    expect(writesTo(client, 'users')[0].payload).toMatchObject({ is_admin: true, is_manager: false });
    expect(writesTo(client, 'company_to_users')[0].payload).toMatchObject({ company_id: 100, is_active: true });
    expect(writesTo(client, 'user_profiles')).toHaveLength(1);
  });

  it('appends a numeric suffix when the slug is taken', async () => {
    const { POST } = await loadRoute({ takenSlugs: ['acme-kft', 'acme-kft-2'] });
    expect((await (await POST(post(VALID))).json()).slug).toBe('acme-kft-3');
  });

  it('sends the onboarding booking email and records it', async () => {
    const { POST } = await loadRoute();
    await POST(post(VALID));
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: VALID.email, calendlyUrl: process.env.CALENDLY_ONBOARDING_URL }));
    const update = writesTo(client, 'company').find((w) => w.method === 'update');
    expect(update?.payload).toHaveProperty('onboarding_link_sent_at');
    expect(writesTo(client, 'funnel_events')[0].payload).toMatchObject({ event_type: 'onboarding_link_sent' });
  });

  it('still succeeds when the onboarding email fails', async () => {
    const { POST } = await loadRoute({ emailFails: true });
    expect((await POST(post(VALID))).status).toBe(200);
  });

  it('rolls back the auth user when the company insert fails', async () => {
    const { POST } = await loadRoute({ failOn: 'company' });
    expect((await POST(post(VALID))).status).toBe(400);
    expect(client.auth.admin.deleteUser).toHaveBeenCalledWith('new-user-id');
  });

  it('rolls back user, profile row and company when linking fails', async () => {
    const { POST } = await loadRoute({ failOn: 'company_to_users' });
    expect((await POST(post(VALID))).status).toBe(400);
    expect(client.auth.admin.deleteUser).toHaveBeenCalled();
    expect(writesTo(client, 'users').some((w) => w.method === 'delete')).toBe(true);
    expect(writesTo(client, 'company').some((w) => w.method === 'delete' && w.filters['id'] === 100)).toBe(true);
  });

  it('rolls back everything when the profile insert fails', async () => {
    const { POST } = await loadRoute({ failOn: 'user_profiles' });
    expect((await POST(post(VALID))).status).toBe(400);
    expect(writesTo(client, 'company_to_users').some((w) => w.method === 'delete')).toBe(true);
    expect(writesTo(client, 'company').some((w) => w.method === 'delete')).toBe(true);
  });
});
