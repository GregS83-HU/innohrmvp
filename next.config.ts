import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   serverExternalPackages: ['pdf-parse'],
};

module.exports = {
  i18n: {
    locales: ['en', 'fr', 'hu'],
    defaultLocale: 'en',
  }
}

export default nextConfig;
