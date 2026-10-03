import { describe, it, expect } from 'vitest';
import { addBusinessDays } from '../../lib/businessDays';
import { slugify } from '../../lib/slug';
import { safeErrorInfo } from '../../lib/logSafe';
import { encryptPassword, decryptPassword } from '../../lib/encryption';
import { monthlyCost, computeGrowthCrossoverHeadcount } from '../../lib/billing/planCrossover';
import {
  CANDIDATE_FEEDBACK_TONES,
  DEFAULT_CANDIDATE_FEEDBACK_TONE,
  isCandidateFeedbackTone,
  buildCandidateFeedbackToneInstruction,
} from '../../lib/candidateFeedbackTone';
import { ONBOARDING_GATED_FEATURES, FEATURE_RULES, FEATURE_COPY } from '../../src/config/entitlements';

describe('addBusinessDays (onboarding reminder SLA)', () => {
  it('skips weekends', () => {
    // Friday 2026-10-02 + 1 business day = Monday 2026-10-05
    expect(addBusinessDays(new Date('2026-10-02T09:00:00Z'), 1).toISOString().slice(0, 10)).toBe('2026-10-05');
  });
  it('counts 3 business days from a Wednesday into next week', () => {
    expect(addBusinessDays(new Date('2026-09-30T09:00:00Z'), 3).toISOString().slice(0, 10)).toBe('2026-10-05');
  });
  it('returns the same instant for 0 days and does not mutate the input', () => {
    const start = new Date('2026-10-03T00:00:00Z');
    expect(addBusinessDays(start, 0).getTime()).toBe(start.getTime());
    addBusinessDays(start, 5);
    expect(start.toISOString()).toBe('2026-10-03T00:00:00.000Z');
  });
});

describe('slugify (company URL slug at signup)', () => {
  it.each([
    ['Acme, Inc.', 'acme-inc'],
    ['Égé Kft. ', 'ege-kft'],
    ['Árvíztűrő Tükörfúrógép', 'arvizturo-tukorfurogep'],
    ['---', ''],
    ['A'.repeat(100), 'a'.repeat(60)],
  ])('%s -> %s', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe('safeErrorInfo (no PII in logs)', () => {
  it('never returns the message of an Error', () => {
    const err = new Error('duplicate key value: jane.doe@example.com');
    expect(safeErrorInfo(err)).toBe('Error');
  });
  it('returns a Postgrest code, never details', () => {
    expect(safeErrorInfo({ code: '23505', message: 'Key (email)=(jane@x.com)', details: 'jane' })).toBe('23505');
  });
  it('returns a generic label for anything else', () => {
    expect(safeErrorInfo('jane@x.com')).toBe('unknown error');
    expect(safeErrorInfo(null)).toBe('unknown error');
  });
});

describe('encryption (company SMTP password at rest)', () => {
  it('round-trips and never stores plaintext', () => {
    const enc = encryptPassword('s3cret-smtp-pass');
    expect(enc).not.toContain('s3cret');
    expect(decryptPassword(enc)).toBe('s3cret-smtp-pass');
  });
  it('produces a different ciphertext each time (random salt/IV)', () => {
    expect(encryptPassword('x')).not.toBe(encryptPassword('x'));
  });
  it('rejects tampered ciphertext (GCM auth tag)', () => {
    const buf = Buffer.from(encryptPassword('hello'), 'base64');
    buf[buf.length - 1] ^= 0xff;
    expect(() => decryptPassword(buf.toString('base64'))).toThrow();
  });
  it('refuses to run with a missing or malformed key', () => {
    const saved = process.env.ENCRYPTION_KEY;
    try {
      process.env.ENCRYPTION_KEY = 'short';
      expect(() => encryptPassword('x')).toThrow(/64 characters/);
      delete process.env.ENCRYPTION_KEY;
      expect(() => encryptPassword('x')).toThrow(/not set/);
    } finally {
      process.env.ENCRYPTION_KEY = saved;
    }
  });
});

describe('plan crossover (Core vs Growth pricing)', () => {
  const core = { baseFeeHuf: 25000, perSeatFeeHuf: 1000 };
  const growth = { baseFeeHuf: 40000, perSeatFeeHuf: 750 };

  it('computes monthly cost as base + seats', () => {
    expect(monthlyCost(core, 30)).toBe(55000);
    expect(monthlyCost(growth, 31)).toBe(63250);
  });
  it('finds 61 as the first headcount where Growth is strictly cheaper', () => {
    expect(computeGrowthCrossoverHeadcount(core, growth)).toBe(61);
    expect(monthlyCost(growth, 60)).toBe(monthlyCost(core, 60));
    expect(monthlyCost(growth, 61)).toBeLessThan(monthlyCost(core, 61));
  });
  it('the Core 30-employee cap keeps every Core account below the crossover', () => {
    expect(computeGrowthCrossoverHeadcount(core, growth)!).toBeGreaterThan(30);
  });
  it('returns null when Growth can never be cheaper', () => {
    expect(computeGrowthCrossoverHeadcount(core, { baseFeeHuf: 40000, perSeatFeeHuf: 1000 })).toBeNull();
  });
});

describe('candidate feedback tone', () => {
  it('defaults to balanced and validates values', () => {
    expect(DEFAULT_CANDIDATE_FEEDBACK_TONE).toBe('balanced');
    expect(isCandidateFeedbackTone('warm')).toBe(true);
    expect(isCandidateFeedbackTone('rude')).toBe(false);
    expect(isCandidateFeedbackTone(undefined)).toBe(false);
  });
  it('every tone yields an instruction that only governs candidateFeedback', () => {
    for (const tone of CANDIDATE_FEEDBACK_TONES) {
      const text = buildCandidateFeedbackToneInstruction(tone);
      expect(text).toContain('candidateFeedback');
      expect(text).toMatch(/Do not change the score/);
    }
  });
});

describe('entitlement config integrity', () => {
  it('every feature has a rule and paywall copy', () => {
    for (const key of Object.keys(FEATURE_RULES)) {
      expect(FEATURE_COPY[key as keyof typeof FEATURE_COPY], key).toBeDefined();
    }
  });
  it('recruitment, tickets and reporting are usable right after self-serve signup', () => {
    expect(ONBOARDING_GATED_FEATURES.has('recruitment.openPosition')).toBe(false);
    expect(ONBOARDING_GATED_FEATURES.has('support.tickets')).toBe(false);
    expect(ONBOARDING_GATED_FEATURES.has('reporting.advanced')).toBe(false);
  });
});
