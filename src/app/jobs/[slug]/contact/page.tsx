'use client';

import ContactForm from '../../../../../components/ContactForm';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ContactPage() {
  const [isOpen, setIsOpen] = useState(true);
  const params = useParams();
    const slug = typeof params.slug === 'string' ? params.slug : '';

  return (
    <ContactForm
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={slug === 'demo' ? 'demo' : 'other'}
      slug={slug} // <-- pass slug here for redirection
    />
  );
}
