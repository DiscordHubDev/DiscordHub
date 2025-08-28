import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/servers-sitemap.xml', destination: '/sitemap/servers' },
        { source: '/bot-sitemap.xml', destination: '/sitemap/bots' },
        {
          source: '/api/get_bot_server_count',
          destination:
            'https://getbotserver.dawngs.top/api/get_bot_server_count',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
    ],
  },
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    config.module.rules.push({
      test: /\.node$/,
      type: 'asset/resource',
    });
    if (!dev && !isServer) {
      config.devtool = false;
    }
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@takumi-rs/core');
    }
    return config;
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
};

export default nextConfig;
