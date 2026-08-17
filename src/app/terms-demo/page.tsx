// src/app/terms-demo/page.tsx
'use client';

import React from 'react';
import TermsDemoContent from '../../../components/legal/TermsDemoContent';

export default function TermsDemoPage() {
  return <TermsDemoContent privacyHref="/privacy-demo" />;
}
