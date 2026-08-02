import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LOCALE_COOKIE } from '../../../../../i18n/config';
import { getHelpSection } from '../../../../../../lib/help/content';

export default async function HelpSectionPage({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  const { section } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE)?.value || 'en';

  const doc = getHelpSection(section, locale);
  if (!doc) notFound();

  return (
    <article>
      <h2 className="font-heading text-2xl font-bold text-gray-800 mb-4">{doc.title}</h2>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h3 className="font-heading text-lg font-semibold text-gray-800 mt-6 mb-2">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="font-heading text-base font-semibold text-gray-700 mt-4 mb-2">{children}</h4>
          ),
          p: ({ children }) => <p className="text-gray-600 leading-relaxed mb-4">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-gray-600 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-gray-600 mb-4">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
          a: ({ href, children }) => (
            <a href={href} className="text-brand-600 hover:underline font-medium">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-brand-50">{children}</thead>,
          th: ({ children }) => (
            <th className="text-left px-3 py-2 font-semibold text-gray-700 border-b border-gray-200">{children}</th>
          ),
          td: ({ children }) => <td className="px-3 py-2 text-gray-600 border-b border-gray-100">{children}</td>,
        }}
      >
        {doc.content}
      </ReactMarkdown>
    </article>
  );
}
