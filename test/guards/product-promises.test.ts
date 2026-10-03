// Guards for promises made to customers in product copy / the privacy notice
// that are easy to break by accident in a refactor.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '../..');

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? filesUnder(full) : /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe('Job Assistant: "no data is stored after the session ends"', () => {
  const files = [...filesUnder(join(ROOT, 'src/app/api/job-assistant'))];

  it('no Job Assistant API route touches the database or storage', () => {
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      expect(src, f).not.toMatch(/supabase|createClient|\.from\(['"]|\.storage\b/i);
    }
  });

  it('no Job Assistant API route consumes company AI credits', () => {
    for (const f of files) expect(readFileSync(f, 'utf8'), f).not.toMatch(/consumeCredit/);
  });
});

describe('Medical certificates: content never leaves HRInno (manual entry only)', () => {
  it('certificate routes do not call AI or OCR providers', () => {
    for (const f of filesUnder(join(ROOT, 'src/app/api/medical-certificates'))) {
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/openrouter|openai|ocr\.space|tesseract/i);
    }
  });
});

describe('Checkout: founding discounts are never public promo codes', () => {
  it('create-subscription keeps allow_promotion_codes disabled', () => {
    const src = readFileSync(join(ROOT, 'src/app/api/stripe/create-subscription/route.ts'), 'utf8');
    expect(src).toMatch(/allow_promotion_codes:\s*false/);
  });
});

describe('Logs: no raw error messages that may contain candidate PII', () => {
  it('CV analysis routes log errors through safeErrorInfo', () => {
    for (const r of ['analyse-cv', 'analyse-massive']) {
      const src = readFileSync(join(ROOT, `src/app/api/${r}/route.ts`), 'utf8');
      expect(src, r).toMatch(/safeErrorInfo/);
    }
  });
});
