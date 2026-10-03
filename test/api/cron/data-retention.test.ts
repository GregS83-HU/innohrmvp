import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const ROUTE_PATH = '../../../src/app/api/cron/data-retention/route';
const DATA_RETENTION_PATH = '../../../lib/dataRetention';
const SWEEP_SUMMARY = { medical_certificate: { retentionDays: 90, deleted: 2 } };

const ORIGINAL_CRON_SECRET = process.env.CRON_SECRET;

async function loadRoute() {
  vi.resetModules();
  vi.doMock(DATA_RETENTION_PATH, () => ({ runRetentionSweep: vi.fn(async () => SWEEP_SUMMARY) }));
  return import(ROUTE_PATH);
}

function req(authHeader?: string) {
  const headers = new Headers();
  if (authHeader) headers.set('authorization', authHeader);
  return new NextRequest('http://localhost/api/cron/data-retention', { headers });
}

describe('GET /api/cron/data-retention', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    process.env.CRON_SECRET = ORIGINAL_CRON_SECRET;
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

  it('runs the sweep when the bearer token matches CRON_SECRET', async () => {
    process.env.CRON_SECRET = 'the-real-secret';
    const { GET } = await loadRoute();
    const res = await GET(req('Bearer the-real-secret'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.summary).toEqual(SWEEP_SUMMARY);
  });
});
