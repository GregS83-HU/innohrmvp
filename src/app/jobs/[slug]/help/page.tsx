import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE } from '../../../../i18n/config';
import { getHelpSections } from '../../../../../lib/help/content';

export default async function HelpIndexPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE)?.value || 'en';
  const sections = getHelpSections(locale);

  const first = sections[0]?.slug ?? 'getting-started';
  redirect(`/jobs/${slug}/help/${first}`);
}
