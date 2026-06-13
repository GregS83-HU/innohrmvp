import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  
  async rewrites() {
    return [
      {
        // This catches everything hitting the root domain homepage
        source: '/',
        destination: 'https://hrinno-marketing.vercel.app/',
      },
      {
        // This catches sub-pages if you build them later (e.g., /pricing, /about)
        // while allowing your main app paths (like /dashboard or /login) to load normally
        source: '/:path((?!login|dashboard|api|_next|static).*)',
        destination: 'https://hrinno-marketing.vercel.app/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);