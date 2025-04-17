import type { IConfig } from 'next-sitemap';

const siteUrl = 'https://dchubs.org';

const config: IConfig = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ['/api/*', '/admin/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      `${siteUrl}/server-sitemap.xml`,
      `${siteUrl}/bot-sitemap.xml`,
    ],
  },
};

export default config;
