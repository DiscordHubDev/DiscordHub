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
  'DiscordHubs 服務條款',
  'DiscordHubs 條款',
  'DiscordHubs 使用條款',
];

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://dchubs.org';

  return {
    title: '服務條款 | Discord伺服器列表 - DiscordHubs',
    description:
      'DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此了解 DiscordHubs 平台的服務使用條款和內容',
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
      title: '服務條款 | Discord伺服器列表 - DiscordHubs',
      description:
        'DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此了解 DiscordHubs 平台的服務使用條款和內容',
      url: base,
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
      title: '服務條款 | Discord伺服器列表 - DiscordHubs',
      description:
        'DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此了解 DiscordHubs 平台的服務使用條款和內容',
      images: ['/dchub.png'],
    },
  };
}

export default function TermsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
