// src/app/jobs/[slug]/terms-demo/page.tsx
'use client';

import React from 'react';
import TermsDemoContent from '../../../../../components/legal/TermsDemoContent';

interface TermsDemoPageProps {
  params: Promise<{ slug: string }>;
}

export default function TermsDemoPage({ params }: TermsDemoPageProps) {
  const { slug } = React.use(params);
  return <TermsDemoContent privacyHref={`/jobs/${slug}/privacy-demo`} />;
}
