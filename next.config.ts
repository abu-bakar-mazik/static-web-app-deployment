import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const nextConfig: NextConfig = {
  // productionBrowserSourceMaps: false,
  // reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['@chakra-ui/react', "hugeicons-react"],
    // cssChunking: true,
    // useLightningcss: true,
    // webVitalsAttribution: ['CLS', 'LCP'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Keep-Alive',
            value: 'timeout=120',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          }
        ],
      },
    ];
  },
} satisfies NextConfig;

export default withBundleAnalyzer(nextConfig);
