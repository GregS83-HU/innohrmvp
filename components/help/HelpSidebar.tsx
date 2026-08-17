'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import type { HelpSectionSummary } from '../../lib/help/content';

export default function HelpSidebar({
  sections,
  slug,
}: {
  sections: HelpSectionSummary[];
  slug: string;
}) {
  const [query, setQuery] = useState('');
  const pathname = usePathname();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(
      (s) => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q)
    );
  }, [sections, query]);

  return (
    <nav className="w-full md:w-64 flex-shrink-0 md:border-r md:border-gray-100 md:pr-4">
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the guide…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <ul className="space-y-1">
        {filtered.map((s) => {
          const href = `/jobs/${slug}/help/${s.slug}`;
          const active = pathname === href;
          return (
            <li key={s.slug}>
              <Link
                href={href}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-brand-100 text-brand-700 font-medium'
                    : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {s.title}
              </Link>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-3 py-2 text-sm text-gray-400">No sections match &ldquo;{query}&rdquo;.</li>
        )}
      </ul>
    </nav>
  );
}
