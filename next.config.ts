import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Security headers (only in production)
  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Experimental features (only enable stable ones)
  experimental: {
    // Enable modern JavaScript features
    esmExternals: true,
  },

  // Environment variables to expose to client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites for API proxying if needed
  async rewrites() {
    return [
      // Example: proxy to external API
      // {
      //   source: '/api/external/:path*',
      //   destination: 'https://external-api.com/:path*',
      // },
    ];
  },

  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },

  // Internationalization (if needed)
  // i18n: {
  //   locales: ['en', 'es', 'fr'],
  //   defaultLocale: 'en',
  // },

  // Custom webpack configuration (simplified)
  webpack: (config: any) => {
    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Custom server configuration
  serverRuntimeConfig: {
    // Will only be available on the server side
    mySecret: 'secret',
  },

  // Public runtime configuration
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
};

export default nextConfig;
