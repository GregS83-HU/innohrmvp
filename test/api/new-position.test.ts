import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockEmptyCookies, writesTo } from '../helpers/supabaseMock';
import { jsonRequest, COMPANY_A } from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/new-position/route';

let client: ReturnType<typeof createSupabaseMock>;

async function loadRoute(entitlement: { allowed: boolean; reason?: string; plan?: string } = { allowed: true }) {
  vi.resetModules();
  vi.doMock('../../lib/entitlements', async () => {
    const real = await vi.importActual<typeof import('../../lib/entitlements')>('../../lib/entitlements');
    return { ...real, hasFeatureAccess: vi.fn(async () => entitlement) };
  });
  client = createSupabaseMock({
    tables: {
      company_to_users: () => ({ data: { company_id: COMPANY_A } }),
      openedpositions: () => ({ data: [{ id: 555 }] }),
    },
  });
  vi.doMock('@supabase/auth-helpers-nextjs', () => ({ createServerComponentClient: () => client }));
  mockEmptyCookies();
  return import(ROUTE_PATH);
}

const BODY = {
  user_id: 'admin-a',
  manager_id: 'manager-a',
  position_name: 'Backend Engineer',
  position_description: 'Short public description',
  position_description_detailed: 'Long AI-matching description',
  position_start_date: '2026-11-01',
  employment_type: 'full_time',
};
const post = (body: Record<string, unknown>) => jsonRequest('http://localhost/api/new-position', 'POST', body);

describe('POST /api/new-position (open a job posting)', () => {
  beforeEach(() => vi.resetModules());

  it('400 when a required field is missing', async () => {
    const { POST } = await loadRoute();
    expect((await POST(post({ ...BODY, position_name: '' }))).status).toBe(400);
  });

  it('400 when employment type is missing', async () => {
    const { POST } = await loadRoute();
    expect((await POST(post({ ...BODY, employment_type: undefined }))).status).toBe(400);
  });

  it('400 on an invalid candidate feedback tone', async () => {
    const { POST } = await loadRoute();
    expect((await POST(post({ ...BODY, candidate_feedback_tone: 'harsh' }))).status).toBe(400);
  });

  it('403 UPGRADE_REQUIRED when the plan position cap is reached', async () => {
    const { POST } = await loadRoute({ allowed: false, reason: 'plan_limit_reached', plan: 'Free' });
    const res = await POST(post(BODY));
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: 'UPGRADE_REQUIRED', feature: 'recruitment.openPosition', reason: 'plan_limit_reached' });
    expect(writesTo(client, 'openedpositions')).toHaveLength(0);
  });

  it("creates the position in the creator's company with sensible defaults", async () => {
    const { POST } = await loadRoute();
    const res = await POST(post(BODY));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ id: 555 });
    const [row] = writesTo(client, 'openedpositions')[0].payload as Record<string, unknown>[];
    expect(row).toMatchObject({
      company_id: COMPANY_A,
      employment_type: 'full_time',
      salary_currency: 'HUF',
      salary_public: false,
      candidate_feedback_tone: 'balanced',
      location: null,
      application_deadline: null,
    });
  });

  it('stores the chosen feedback tone and salary data', async () => {
    const { POST } = await loadRoute();
    await POST(post({ ...BODY, candidate_feedback_tone: 'very_soft', salary_min: 800000, salary_max: 1200000, salary_public: true }));
    const [row] = writesTo(client, 'openedpositions')[0].payload as Record<string, unknown>[];
    expect(row).toMatchObject({ candidate_feedback_tone: 'very_soft', salary_min: 800000, salary_max: 1200000, salary_public: true });
  });
});
