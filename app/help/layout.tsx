import { GetbaseUrl } from '@/lib/utils';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

const keywords = [
  '新增 Discord 伺服器',
  'Discord 伺服器添加',
  '創建 Discord 伺服器',
  'Discord 伺服器列表',
  '熱門 Discord 伺服器',
  '免費 Discord 伺服器',
  '人氣 Discord 伺服器',
  'Discord 伺服器推薦',
  '大型 Discord 伺服器',
  '小型 Discord 伺服器',
  '公開 Discord 伺服器',
  'DiscordHubs 使用教學',
  'DiscordHubs 教學頁面',
  'DiscordHubs 使用說明',
];

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://dchubs.org';

  return {
    title: '使用教學 | Discord伺服器列表 - DiscordHubs',
    description:
      'DiscordHubs 是專為中文用戶打造的 Discord 伺服器與機器人平台，讓你輕鬆探索熱門社群和喜愛的機器人、管理已發布的內容，並靈活運用各項功能擴展影響力。',
    icons: {
      icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png' }],
    },
    keywords: keywords.join('，'),
    authors: [
      {
        name: 'DiscordHubs 團隊',
        url: 'https://dchubs.org',
      },
    ],
    metadataBase: new URL(base),
    openGraph: {
      title: '使用教學 | Discord伺服器列表 - DiscordHubs',
      description:
        'DiscordHubs 是專為中文用戶打造的 Discord 伺服器與機器人平台，讓你輕鬆探索熱門社群和喜愛的機器人、管理已發布的內容，並靈活運用各項功能擴展影響力。',
      url: `${base}/help`,
      siteName: 'DiscordHubs',
      images: [
        {
          url: '/dchub.png',
          alt: 'DiscordHubs-icon',
        },
      ],
      locale: 'zh-TW',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: '使用教學 | Discord伺服器列表 - DiscordHubs',
      description:
        'DiscordHubs 是專為中文用戶打造的 Discord 伺服器與機器人平台，讓你輕鬆探索熱門社群和喜愛的機器人、管理已發布的內容，並靈活運用各項功能擴展影響力。',
      images: ['/dchub.png'],
    },
  };
}

export default function HelpLayout({ children }: { children: ReactNode }) {
  const baseUrl = GetbaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Discord伺服器列表',
    description: 'DiscordHubs平台使用教學與說明',
    url: `${baseUrl}/help`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '首頁',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '使用教學',
          item: `${baseUrl}/help`,
        },
      ],
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'DiscordHubs',
      url: baseUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
      />
      {children}
    </>
  );
}
