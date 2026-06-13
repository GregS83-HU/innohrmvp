import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  
  async rewrites() {
    return [
      {
        // Matches any root-level path hitting the domain
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'hrinno.hu',
          },
        ],
        // Points directly to your standalone, fast marketing deployment
        destination: 'https://hrinno-marketing.vercel.app/:path*', 
      },
    ];
  },
};

export default withNextIntl(nextConfig);