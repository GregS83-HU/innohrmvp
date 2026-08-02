import { cookies } from 'next/headers';
import { LOCALE_COOKIE } from '../../../../i18n/config';
import { getHelpSections } from '../../../../../lib/help/content';
import HelpSidebar from '../../../../../components/help/HelpSidebar';

export default async function HelpLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE)?.value || 'en';
  const sections = getHelpSections(locale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-indigo-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            User Guide
          </span>
          <h1 className="font-heading text-3xl font-bold text-gray-800">HRInno User Guide</h1>
          <p className="text-gray-500 mt-1">How to use every feature currently available in HRInno.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-8">
          <HelpSidebar sections={sections} slug={slug} />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
