import { GetbaseUrl } from '@/lib/utils';
import { Metadata } from 'next';
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
  'DiscordHubs 隱私條款',
  'DiscordHubs 條款',
  'DiscordHubs 隱私權條款',
];

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://dchubs.org';

  return {
    title: '隱私條款 | Discord伺服器列表 - DiscordHubs',
    description:
      '了解 DiscordHubs 如何透過隱私權政策與使用條款，保障您的資料與權益，並提供安全可靠的 Discord 中文伺服器與機器人服務。',
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
      title: '隱私條款 | Discord伺服器列表 - DiscordHubs',
      description:
        '了解 DiscordHubs 如何透過隱私權政策與使用條款，保障您的資料與權益，並提供安全可靠的 Discord 中文伺服器與機器人服務。',
      url: `${base}/privacy`,
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
      title: '隱私條款 | Discord伺服器列表 - DiscordHubs',
      description:
        '了解 DiscordHubs 如何透過隱私權政策與使用條款，保障您的資料與權益，並提供安全可靠的 Discord 中文伺服器與機器人服務。',
      images: ['/dchub.png'],
    },
  };
}

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  const baseUrl = GetbaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Discord伺服器列表',
    description: 'DiscordHubs平台的隱私權政策與使用條款說明',
    url: `${baseUrl}/privacy`,
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
          name: '隱私條款',
          item: `${baseUrl}/privacy`,
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
