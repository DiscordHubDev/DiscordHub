import type { IConfig } from 'next-sitemap';

const siteUrl = 'https://dchubs.org'; // ⬅️ 改成你的正式網域

const config: IConfig = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ['/api/*', '/admin/*'], // ⬅️ 排除不想被爬的頁面
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
