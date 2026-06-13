import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  
  async rewrites() {
    return [
      {
        // Intercepts the bare domain homepage and any sub-marketing pages
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.hrinno.hu', // Vercel redirects hrinno.hu here automatically
          },
        ],
        // Pulls content dynamically from your separate marketing app repo
        destination: 'https://hrinno-marketing.vercel.app/:path*', 
      },
    ];
  },
};

export default withNextIntl(nextConfig);