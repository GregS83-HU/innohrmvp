// Structural guard: every API route must either call a lib/authz check or be
// listed below with a reason. A new route that forgets authorization fails
// this test (and therefore the pre-commit hook) instead of shipping open.
//
// KNOWN_GAPS lists routes that are unauthenticated today but should not be.
// When one gets fixed, this test fails until it's removed from the list, so
// the list can't silently go stale. See docs/testing/test-strategy.md.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const API_ROOT = join(__dirname, '../../src/app/api');
const AUTHZ_CALL = /\brequire(SuperAdmin|ServiceSecret|AuthenticatedUser|CompanyMember|CompanyAdmin|SessionToken|Self|SelfOrCompanyAdminOf|SelfOrManagerOf|CompanyMemberSession|EmailToken)\s*(\(|<|;)/;

/** Public by design - anonymous callers are the intended audience. */
const PUBLIC_BY_DESIGN: Record<string, string> = {
  'signup/route.ts': 'Self-serve signup creates the account; there is no caller yet.',
  'contact/route.ts': 'Public lead form; rate-limited and GDPR-consent gated.',
  'positions-public/route.ts': 'Public job board; read-only, open positions only.',
  'analyse-cv/route.ts': 'Candidate applying to a public posting; no candidate account exists.',
  'interview-conclude/route.ts': 'Candidate finishing the virtual interview; verifies the candidate/position link instead.',
  'interview-question/route.ts': 'Candidate virtual interview question generation; no DB access.',
  'job-assistant/analyze/route.ts': 'Free anonymous Job Assistant; stateless (see job-assistant-stateless guard).',
  'job-assistant/improve/route.ts': 'Free anonymous Job Assistant; stateless.',
  'job-assistant/interview/generate/route.ts': 'Free anonymous Job Assistant; stateless.',
  'job-assistant/interview/score/route.ts': 'Free anonymous Job Assistant; stateless.',
  'job-assistant/interview/conclude/route.ts': 'Free anonymous Job Assistant; stateless.',
  'stripe/webhook/route.ts': 'Authenticated by Stripe signature verification, not a user session.',
  'new-position/route.ts': 'Uses the caller cookie session client, so RLS on openedpositions enforces tenant scope.',
  'positions-private/route.ts': 'Uses the caller cookie session client, so RLS enforces tenant scope.',
};

/** Unauthenticated today, and should not be. Each is a tracked finding. */
const KNOWN_GAPS: Record<string, string> = {};

function listRoutes(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listRoutes(full);
    return /^route\.tsx?$/.test(name) ? [relative(API_ROOT, full)] : [];
  });
}

const routes = listRoutes(API_ROOT);
const hasAuthz = (r: string) => AUTHZ_CALL.test(readFileSync(join(API_ROOT, r), 'utf8'));

describe('API route authorization inventory', () => {
  it('discovers the API routes', () => {
    expect(routes.length).toBeGreaterThan(50);
  });

  it('every route uses lib/authz or is explicitly listed as public / known gap', () => {
    const unaccounted = routes.filter((r) => !hasAuthz(r) && !(r in PUBLIC_BY_DESIGN) && !(r in KNOWN_GAPS));
    expect(unaccounted, 'New route without an authz check - add one, or justify it in PUBLIC_BY_DESIGN').toEqual([]);
  });

  it('allowlists only reference routes that still exist', () => {
    const stale = [...Object.keys(PUBLIC_BY_DESIGN), ...Object.keys(KNOWN_GAPS)].filter((r) => !routes.includes(r));
    expect(stale).toEqual([]);
  });

  it('KNOWN_GAPS entries are removed once fixed', () => {
    const fixed = Object.keys(KNOWN_GAPS).filter(hasAuthz);
    expect(fixed, 'These routes now call lib/authz - remove them from KNOWN_GAPS').toEqual([]);
  });

  it('cron routes are protected by the service secret', () => {
    for (const r of routes.filter((r) => r.startsWith('cron/'))) {
      expect(readFileSync(join(API_ROOT, r), 'utf8'), r).toMatch(/requireServiceSecret\(request, 'CRON_SECRET'\)/);
    }
  });

  it('admin routes require a super admin', () => {
    for (const r of routes.filter((r) => r.startsWith('admin/'))) {
      expect(readFileSync(join(API_ROOT, r), 'utf8'), r).toMatch(/requireSuperAdmin\(/);
    }
  });
});
