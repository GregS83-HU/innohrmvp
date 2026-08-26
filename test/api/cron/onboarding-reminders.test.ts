import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSupabaseMock } from '../../helpers/supabaseMock';

const ROUTE_PATH = '../../../src/app/api/cron/onboarding-reminders/route';

const ORIGINAL_CRON_SECRET = process.env.CRON_SECRET;
const ORIGINAL_CALENDLY_URL = process.env.CALENDLY_ONBOARDING_URL;

async function loadRoute() {
  vi.resetModules();
  // No CALENDLY_ONBOARDING_URL configured -> the route short-circuits right
  // after the auth check, which is exactly the behavior this batch of tests
  // is isolating (the business logic past the auth gate isn't changing).
  delete process.env.CALENDLY_ONBOARDING_URL;
  const client = createSupabaseMock({ tables: {} });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  vi.doMock('../../../lib/email-service', () => ({ sendOnboardingReminderEmail: vi.fn() }));
  return import(ROUTE_PATH);
}

function req(authHeader?: string) {
  const headers = new Headers();
  if (authHeader) headers.set('authorization', authHeader);
  return new NextRequest('http://localhost/api/cron/onboarding-reminders', { headers });
}

describe('GET /api/cron/onboarding-reminders', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    process.env.CRON_SECRET = ORIGINAL_CRON_SECRET;
    process.env.CALENDLY_ONBOARDING_URL = ORIGINAL_CALENDLY_URL;
  });

  it('rejects with 401 when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;
    const { GET } = await loadRoute();
    const res = await GET(req('Bearer anything'));
    expect(res.status).toBe(401);
  });

  it('rejects with 401 when the bearer token does not match CRON_SECRET', async () => {
    process.env.CRON_SECRET = 'the-real-secret';
    const { GET } = await loadRoute();
    const res = await GET(req('Bearer wrong-secret'));
    expect(res.status).toBe(401);
  });

  it('passes the auth gate when the bearer token matches CRON_SECRET', async () => {
    process.env.CRON_SECRET = 'the-real-secret';
    const { GET } = await loadRoute();
    const res = await GET(req('Bearer the-real-secret'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, sent: 0, skipped: 'no CALENDLY_ONBOARDING_URL' });
  });
});
