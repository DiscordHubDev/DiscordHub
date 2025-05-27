import type { Metadata } from 'next';
import { ReactNode } from 'react';

const keywords = [
  '新增 Discord 機器人',
  'Discord 機器人添加',
  '創建 Discord 機器人',
  'Discord 伺服器列表',
  '熱門 Discord 伺服器',
  '免費 Discord 伺服器',
  '人氣 Discord 伺服器',
  'Discord 機器人推薦',
  '大型 Discord 機器人',
  '小型 Discord 機器人',
  '公開 Discord 機器人',
];

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://dchubs.org';

  return {
    title: '新增機器人 | Discord機器人列表 - DiscordHubs',
    description:
      'DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此新增你的機器人，讓你的機器人得到宣傳和管理，快速建立專屬的機器人空間。',
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
      title: '新增機器人 | Discord機器人列表 - DiscordHubs',
      description:
        '在 DiscordHubs 新增你的機器人，獲得更多曝光與管理功能，輕鬆打造專屬機器人頁面，讓更多用戶發現並使用你的機器人。',
      url: `${base}/add-bot`,
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
      card: 'summary_large_image',
      title: '新增機器人 | Discord機器人列表 - DiscordHubs',
      description:
        '在 DiscordHubs 新增你的機器人，獲得更多曝光與管理功能，輕鬆打造專屬機器人頁面，讓更多用戶發現並使用你的機器人。',
      images: ['/dchub.png'],
    },
  };
}

export default function AddBotLayout({ children }: { children: ReactNode }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dchubs.org';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Discord伺服器列表',
    description: '在DiscordHubs平台新增你的Discord機器人',
    url: `${baseUrl}/add-bot`,
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
        {
          '@type': 'ListItem',
          position: 3,
          name: '新增機器人',
          item: `${baseUrl}/add-bot`,
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
