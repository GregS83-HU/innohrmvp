import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSupabaseMock, writesTo } from '../helpers/supabaseMock';

const MODULE_PATH = '../../lib/onboarding/completeSelfOnboarding';
const ORIGINAL_CALENDLY_URL = process.env.CALENDLY_ONBOARDING_URL;

let notify: ReturnType<typeof vi.fn>;
let booking: ReturnType<typeof vi.fn>;

async function load(opts: { alreadyCompleted?: boolean; notifyFails?: boolean } = {}) {
  vi.resetModules();
  notify = vi.fn(async () => {
    if (opts.notifyFails) throw new Error('resend down');
    return { success: true };
  });
  booking = vi.fn(async () => ({ success: true }));
  vi.doMock('../../lib/email-service', () => ({
    sendSelfOnboardingNotificationEmail: notify,
    sendOnboardingBookingEmail: booking,
  }));
  const client = createSupabaseMock({
    tables: {
      company: (s) => {
        if (s.method === 'update' && s.columns) {
          return { data: opts.alreadyCompleted ? [] : [{ id: 100, company_name: 'Acme Kft.', slug: 'acme-kft' }] };
        }
        if (s.method === 'select') return { data: { id: 100 } };
        return {};
      },
      company_to_users: (s) => (s.head ? { count: 12 } : { data: [{ user_id: 'admin-1' }] }),
      users: () => ({ data: { id: 'admin-1', user_firstname: 'Ada', user_lastname: 'Lovelace' } }),
      funnel_events: () => ({}),
    },
  });
  const mod = await import(MODULE_PATH);
  return { mod, client };
}

const PARAMS = { companyId: '100', plan: 'Core', billingInterval: 'month' as const, amountPaid: 37000, currency: 'huf' };

describe('completeSelfOnboarding', () => {
  beforeEach(() => {
    process.env.CALENDLY_ONBOARDING_URL = 'https://calendly.test/onboarding';
  });
  afterEach(() => {
    process.env.CALENDLY_ONBOARDING_URL = ORIGINAL_CALENDLY_URL;
  });

  it('unlocks the company with a conditional claim and notifies the owner', async () => {
    const { mod, client } = await load();
    const result = await mod.completeSelfOnboarding(client, { ...PARAMS, assistedCallRequested: false });

    expect(result).toEqual({ completed: true, ownerNotified: true, bookingEmailSent: false });
    const claim = writesTo(client, 'company').find((w) => w.method === 'update')!;
    expect(claim.payload).toMatchObject({ onboarding_completed: true });
    expect(claim.payload).toHaveProperty('onboarding_completed_at');
    expect(claim.payload).not.toHaveProperty('assisted_onboarding_requested');
    expect(claim.filters['onboarding_completed_at']).toEqual({ is: null });
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({
      companyName: 'Acme Kft.',
      adminEmail: 'admin-1@test.local',
      adminName: 'Ada Lovelace',
      employeeCount: 12,
      plan: 'Core',
      assistedCallRequested: false,
    }));
    expect(booking).not.toHaveBeenCalled();
    expect(writesTo(client, 'funnel_events')[0].payload).toMatchObject({ event_type: 'self_onboarding_completed' });
  });

  it('flags assisted onboarding, asks for a call back and sends the Calendly link', async () => {
    const { mod, client } = await load();
    const result = await mod.completeSelfOnboarding(client, { ...PARAMS, assistedCallRequested: true });

    expect(result).toEqual({ completed: true, ownerNotified: true, bookingEmailSent: true });
    expect(writesTo(client, 'company').find((w) => w.method === 'update')!.payload).toMatchObject({ assisted_onboarding_requested: true });
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ assistedCallRequested: true }));
    expect(booking).toHaveBeenCalledWith(expect.objectContaining({ to: 'admin-1@test.local', calendlyUrl: 'https://calendly.test/onboarding' }));
    expect(writesTo(client, 'company').some((w) => w.method === 'update' && (w.payload as Record<string, unknown>).onboarding_link_sent_at)).toBe(true);
  });

  it('does nothing (no emails) when the company was already onboarded - Stripe retries are safe', async () => {
    const { mod, client } = await load({ alreadyCompleted: true });
    const result = await mod.completeSelfOnboarding(client, { ...PARAMS, assistedCallRequested: true });
    expect(result).toEqual({ completed: false, reason: 'already_completed' });
    expect(notify).not.toHaveBeenCalled();
    expect(booking).not.toHaveBeenCalled();
  });

  it('still unlocks the company when the owner email fails', async () => {
    const { mod, client } = await load({ notifyFails: true });
    const result = await mod.completeSelfOnboarding(client, { ...PARAMS, assistedCallRequested: false });
    expect(result).toEqual({ completed: true, ownerNotified: false, bookingEmailSent: false });
  });
});
