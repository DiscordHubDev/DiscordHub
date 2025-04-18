import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/get_bot_server_count',
        destination: 'https://getbotserver.dawngs.top/get_bot_server_count', // 外部 API 地址
      },
      {
        source: '/servers-sitemap.xml',
        destination: '/sitemap/servers',
      },
      {
        source: '/bot-sitemap.xml',
        destination: '/sitemap/bots',
      },
    ];
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
    ],
  },
};

export default nextConfig;
