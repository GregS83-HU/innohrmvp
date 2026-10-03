import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, writesTo } from '../../helpers/supabaseMock';
import { jsonRequest } from '../../helpers/authFixtures';

const ROUTE_PATH = '../../../src/app/api/cron/plan-crossover-check/route';

let client: ReturnType<typeof createSupabaseMock>;
let sendEmail: ReturnType<typeof vi.fn>;

const PRICING = [
  { forfait_name: 'Core', base_fee_huf: 25000, per_seat_fee_huf: 1000 },
  { forfait_name: 'Growth', base_fee_huf: 40000, per_seat_fee_huf: 750 },
];

async function loadRoute(headcounts: Record<number, number>, pricing = PRICING) {
  vi.resetModules();
  sendEmail = vi.fn(async () => ({ success: true }));
  vi.doMock('../../../lib/email-service', () => ({ sendPlanCrossoverEmail: sendEmail }));
  client = createSupabaseMock({
    tables: {
      forfait: () => ({ data: pricing }),
      company: (s) => (s.method === 'select' ? { data: Object.keys(headcounts).map((id) => ({ id: Number(id), company_name: `Co ${id}`, slug: `co-${id}` })) } : {}),
      company_to_users: (s) => ({ data: Array.from({ length: headcounts[s.filters['company_id'] as number] ?? 0 }, (_, i) => ({ user_id: `u${i}` })) }),
      users: () => ({ data: { id: 'u0', user_firstname: 'Ada' } }),
    },
  });
  mockSupabaseJs(client);
  return import(ROUTE_PATH);
}

const cron = (secret?: string) => jsonRequest('http://localhost/api/cron/plan-crossover-check', 'GET', undefined, undefined, secret ? { authorization: `Bearer ${secret}` } : {});

describe('GET /api/cron/plan-crossover-check', () => {
  beforeEach(() => vi.resetModules());

  it('401 without the cron secret', async () => {
    const { GET } = await loadRoute({});
    expect((await GET(cron())).status).toBe(401);
    expect((await GET(cron('wrong'))).status).toBe(401);
  });

  it('notifies only Core companies at or past the crossover headcount, once', async () => {
    const { GET } = await loadRoute({ 1: 30, 2: 61 });
    const body = await (await GET(cron(process.env.CRON_SECRET))).json();
    expect(body).toMatchObject({ success: true, checked: 2, crossoverHeadcount: 61, sent: 1 });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0][0]).toMatchObject({ companyId: 2, employeeCount: 61, coreCost: 86000, growthCost: 85750, monthlySavingsHuf: 250 });
    const marks = writesTo(client, 'company');
    expect(marks).toHaveLength(1);
    expect(marks[0].filters['id']).toBe(2);
  });

  it('only considers companies not already notified', async () => {
    const { GET } = await loadRoute({});
    await GET(cron(process.env.CRON_SECRET));
    const q = client.calls.find((c) => c.table === 'company' && c.method === 'select');
    expect(q?.filters).toMatchObject({ forfait: 'Core', plan_crossover_notified_at: { is: null } });
  });

  it('skips the sweep when Growth can never be cheaper', async () => {
    const { GET } = await loadRoute({ 2: 500 }, [PRICING[0], { ...PRICING[1], per_seat_fee_huf: 1000 }]);
    const body = await (await GET(cron(process.env.CRON_SECRET))).json();
    expect(body.sent).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
