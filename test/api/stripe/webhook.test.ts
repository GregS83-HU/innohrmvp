import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, writesTo } from '../../helpers/supabaseMock';

const ROUTE_PATH = '../../../src/app/api/stripe/webhook/route';

const SUBSCRIPTION = {
  id: 'sub_new',
  items: {
    data: [
      { id: 'si_seat', price: { product: 'prod_core_seat', recurring: { interval: 'month' } } },
      { id: 'si_base', price: { product: 'prod_core_base', recurring: { interval: 'month' } } },
    ],
  },
};

let client: ReturnType<typeof createSupabaseMock>;
let processedEvents: Set<string>;
let subscriptionsRetrieve: ReturnType<typeof vi.fn>;

async function loadRoute(opts: { companyCurrentSub?: string | null; usedCredits?: number; retrieveFails?: boolean } = {}) {
  vi.resetModules();
  processedEvents = new Set();
  subscriptionsRetrieve = vi.fn(async () => {
    if (opts.retrieveFails) throw new Error('stripe unavailable');
    return SUBSCRIPTION;
  });
  vi.doMock('stripe', () => ({
    default: class {
      webhooks = {
        constructEvent: (body: string, sig: string) => {
          if (sig !== 'valid-signature') throw new Error('No signatures found matching the expected signature');
          return JSON.parse(body);
        },
      };
      customers = { retrieve: vi.fn(async () => ({ deleted: false, metadata: { company_id: '100' } })) };
      subscriptions = { retrieve: subscriptionsRetrieve };
    },
  }));
  client = createSupabaseMock({
    tables: {
      stripe_events: (s) => {
        if (s.method === 'insert') processedEvents.add((s.payload as { id: string }).id);
        return { data: s.method === 'select' && processedEvents.has(s.filters['id'] as string) ? { id: s.filters['id'] } : null };
      },
      forfait: () => ({ data: [{ forfait_name: 'Core', stripe_product_id_base: 'prod_core_base', stripe_price_id_onboarding: 'price_onb' }] }),
      company: (s) =>
        s.method === 'select'
          ? { data: { id: 100, used_ai_credits: opts.usedCredits ?? 40, stripe_subscription_id: opts.companyCurrentSub === undefined ? 'sub_new' : opts.companyCurrentSub } }
          : {},
    },
  });
  mockSupabaseJs(client);
  return import(ROUTE_PATH);
}

function event(type: string, object: Record<string, unknown>, id = `evt_${type}`) {
  return new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': 'valid-signature' },
    body: JSON.stringify({ id, type, data: { object } }),
  });
}

const companyUpdates = () => writesTo(client, 'company').filter((w) => w.method === 'update');

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => vi.resetModules());

  it('rejects an unsigned/forged event with 400 and touches nothing', async () => {
    const { POST } = await loadRoute();
    const res = await POST(new Request('http://localhost/api/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': 'forged' }, body: '{}' }));
    expect(res.status).toBe(400);
    expect(client.calls).toHaveLength(0);
  });

  it('activates the plan on checkout.session.completed', async () => {
    const { POST } = await loadRoute();
    const res = await POST(event('checkout.session.completed', { metadata: { company_id: '100' }, subscription: 'sub_new', customer: 'cus_1' }));
    expect(res.status).toBe(200);
    const [u] = companyUpdates();
    expect(u.filters['id']).toBe('100');
    expect(u.payload).toEqual({
      forfait: 'Core',
      stripe_subscription_id: 'sub_new',
      stripe_customer_id: 'cus_1',
      stripe_base_item_id: 'si_base',
      stripe_seat_item_id: 'si_seat',
      billing_interval: 'month',
      grace_until: null,
    });
  });

  it('tops up AI credits on a credit-pack checkout', async () => {
    const { POST } = await loadRoute({ usedCredits: 40 });
    await POST(event('checkout.session.completed', { metadata: { company_id: '100', credits: '100' } }));
    expect(companyUpdates()[0].payload).toEqual({ used_ai_credits: -60 });
  });

  it('processes each Stripe event only once (idempotency)', async () => {
    const { POST } = await loadRoute();
    const e = () => event('checkout.session.completed', { metadata: { company_id: '100' }, subscription: 'sub_new', customer: 'cus_1' }, 'evt_dup');
    await POST(e());
    await POST(e());
    expect(companyUpdates()).toHaveLength(1);
  });

  it('marks the onboarding fee paid on the first invoice that contains it', async () => {
    const { POST } = await loadRoute();
    await POST(event('invoice.payment_succeeded', {
      subscription: 'sub_new',
      customer: 'cus_1',
      billing_reason: 'subscription_create',
      lines: { data: [{ pricing: { price_details: { price: 'price_onb' } } }] },
    }));
    expect(companyUpdates()[0].payload).toHaveProperty('onboarding_fee_paid_at');
  });

  it('does not mark the onboarding fee on a renewal invoice', async () => {
    const { POST } = await loadRoute();
    await POST(event('invoice.payment_succeeded', { subscription: 'sub_new', customer: 'cus_1', billing_reason: 'subscription_cycle', lines: { data: [] } }));
    expect(companyUpdates()[0].payload).not.toHaveProperty('onboarding_fee_paid_at');
  });

  it('starts a 7-day grace period on a failed payment without downgrading', async () => {
    const { POST } = await loadRoute();
    const before = Date.now();
    await POST(event('invoice.payment_failed', { customer: 'cus_1' }));
    const [u] = companyUpdates();
    expect(Object.keys(u.payload as object)).toEqual(['grace_until']);
    const days = (new Date((u.payload as { grace_until: string }).grace_until).getTime() - before) / 86_400_000;
    expect(days).toBeGreaterThan(6.99);
    expect(days).toBeLessThan(7.01);
  });

  it('clears the plan when the subscription is deleted on Stripe', async () => {
    const { POST } = await loadRoute();
    await POST(event('customer.subscription.deleted', { id: 'sub_new', customer: 'cus_1' }));
    expect(companyUpdates()[0].payload).toMatchObject({ forfait: null, stripe_subscription_id: null, billing_interval: null });
  });

  it('ignores a stale deletion for an old subscription after the company resubscribed', async () => {
    const { POST } = await loadRoute({ companyCurrentSub: 'sub_newer' });
    await POST(event('customer.subscription.deleted', { id: 'sub_old', customer: 'cus_1' }));
    expect(companyUpdates()).toHaveLength(0);
  });

  it('only acts on subscription.updated when it is a cancellation', async () => {
    const { POST } = await loadRoute();
    await POST(event('customer.subscription.updated', { id: 'sub_new', customer: 'cus_1', status: 'past_due' }, 'evt_a'));
    expect(companyUpdates()).toHaveLength(0);
    await POST(event('customer.subscription.updated', { id: 'sub_new', customer: 'cus_1', status: 'canceled' }, 'evt_b'));
    expect(companyUpdates()[0].payload).toMatchObject({ forfait: null });
  });

  it('a Stripe retry after a handler failure is still processed', async () => {
    const { POST } = await loadRoute({ retrieveFails: true });
    const e = () => event('checkout.session.completed', { metadata: { company_id: '100' }, subscription: 'sub_new', customer: 'cus_1' }, 'evt_retry');
    expect((await POST(e())).status).toBe(500);
    subscriptionsRetrieve.mockImplementation(async () => SUBSCRIPTION);
    await POST(e());
    expect(companyUpdates()).toHaveLength(1);
  });
});
