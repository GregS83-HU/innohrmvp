import { SupabaseClient } from '@supabase/supabase-js';

/** Lowercase, ASCII-hyphenated slug from a display name (e.g. "Acme, Inc." -> "acme-inc"). */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining accents (after NFD decomposition)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Generates a company slug guaranteed unique against `company.slug` (which
 * has a unique DB index - see the self-serve-signup migration) by appending
 * -2, -3, ... until a free one is found.
 */
export async function generateUniqueCompanySlug(supabase: SupabaseClient, companyName: string): Promise<string> {
  const base = slugify(companyName) || 'company';
  let candidate = base;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase.from('company').select('id').eq('slug', candidate).maybeSingle();
    if (error) throw new Error(`Slug uniqueness check failed: ${error.message}`);
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
