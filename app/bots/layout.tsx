import { GetbaseUrl } from '@/lib/utils';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

const keywords = [
  '熱門 Discord 機器人',
  '中文 Discord 機器人',
  '免費 Discord 機器人',
  '管理 Discord 機器人',
  '音樂機器人',
  '遊戲機器人',
  '推薦 Discord 機器人',
  '機器人排行榜',
  'Discord bot list',
  'DiscordHubs 熱門機器人',
];

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://dchubs.org';

  return {
    title: '熱門機器人 | Discord機器人列表 - DiscordHubs',
    description:
      '歡迎來到 DiscordHubs，這裡網羅熱門 Discord 中文機器人，包含免費管理工具、優質音樂機器人與實用遊戲機器人，依標籤與分類輕鬆探索。同時提供完整伺服器導覽，協助您發現、宣傳並加入各類精彩社群。',
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
      title: '熱門機器人推薦 | 精選 Discord 中文機器人 - DiscordHubs',
      description:
        'DiscordHubs 是最佳的 Discord 中文伺服器與機器人列表平台，協助您探索與宣傳伺服器，加入喜愛的機器人來為伺服器增添功能與活躍成員。',
      url: `${base}/bots`,
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
      title: '熱門機器人推薦 | 精選 Discord 中文機器人 - DiscordHubs',
      description:
        'DiscordHubs 是最佳的 Discord 中文伺服器與機器人列表平台，協助您探索與宣傳伺服器，加入喜愛的機器人來為伺服器增添功能與活躍成員。',
      images: ['/dchub.png'],
    },
  };
}

export default function BotsLayout({ children }: { children: ReactNode }) {
  const baseUrl = GetbaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Discord伺服器列表',
    description: '探索DiscordHubs平台精選的熱門Discord中文機器人',
    url: `${baseUrl}/bots`,
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
          name: '機器人列表',
          item: `${baseUrl}/bots`,
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
