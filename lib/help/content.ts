import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const HELP_CONTENT_DIR = path.join(process.cwd(), 'content', 'help');
const DEFAULT_LOCALE = 'en';

export interface HelpSectionSummary {
  slug: string;
  title: string;
  summary: string;
  order: number;
}

export interface HelpSection extends HelpSectionSummary {
  content: string;
}

function localeDir(locale: string): string {
  const dir = path.join(HELP_CONTENT_DIR, locale);
  return fs.existsSync(dir) ? dir : path.join(HELP_CONTENT_DIR, DEFAULT_LOCALE);
}

/** All help sections for a locale (falling back to English), sorted by frontmatter `order`. */
export function getHelpSections(locale: string): HelpSectionSummary[] {
  const dir = localeDir(locale);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data } = matter(raw);
      return {
        slug: file.replace(/\.md$/, ''),
        title: data.title ?? file,
        summary: data.summary ?? '',
        order: data.order ?? 0,
      };
    })
    .sort((a, b) => a.order - b.order);
}

/** One help section's full content for a locale (falling back to English, then to the English copy of that slug if the locale is missing just that file). */
export function getHelpSection(slug: string, locale: string): HelpSection | null {
  let dir = localeDir(locale);
  let filePath = path.join(dir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    dir = path.join(HELP_CONTENT_DIR, DEFAULT_LOCALE);
    filePath = path.join(dir, `${slug}.md`);
  }
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    summary: data.summary ?? '',
    order: data.order ?? 0,
    content,
  };
}
