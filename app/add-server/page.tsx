import { getUserGuildsWithBotStatus } from '@/lib/get-user-guild';
import ServerClient from '@/components/server/server-home';
import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { GetbaseUrl } from '@/lib/utils';

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
];

function resolveMetadataBase(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dchubs.org');
  } catch {
    return new URL('https://dchubs.org');
  }
}

export const metadata: Metadata = {
  title: `新增伺服器 | Discord伺服器列表 - DiscordHubs`,
  description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此新增你的伺服器，讓你的伺服器得到宣傳和管理，快速建立專屬的社群空間。`,
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
  metadataBase: resolveMetadataBase(),
  openGraph: {
    title: `新增伺服器 | DiscordHubs`,
    description: `在 DiscordHubs 上架你的 Discord 中文伺服器，提升曝光度、吸引更多成員，打造專屬高互動社群。`,
    url: 'https://dchubs.org/add-server',
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
    title: `新增伺服器 | DiscordHubs`,
    description: `在 DiscordHubs 上架你的 Discord 中文伺服器，提升曝光度、吸引更多成員，打造專屬高互動社群。`,
    images: ['/dchub.png'],
  },
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.access_token) {
    return redirect('/api/auth/signin/discord?callbackUrl=/add-server');
  }

  const { activeServers, inactiveServers } = await getUserGuildsWithBotStatus(
    session.access_token,
    session.discordProfile?.id || '',
  );

  const baseUrl = GetbaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Discord伺服器列表',
    description: '在DiscordHubs平台新增你的Discord伺服器',
    url: `${baseUrl}/add-server`,
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
          name: '伺服器列表',
          item: `${baseUrl}/servers`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: '新增伺服器',
          item: `${baseUrl}/add-server`,
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
      <ServerClient
        activeServers={activeServers}
        inactiveServers={inactiveServers}
      />
    </>
  );
}
