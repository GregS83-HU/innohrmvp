import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
   serverExternalPackages: ['pdf-parse'],
};


export default nextConfig;
