import { getUserGuildsWithBotStatus } from '@/lib/get-user-guild';
import ServerClient from '@/components/server/server-home';
import { authOptions } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getServerByGuildId } from '@/lib/actions/servers';
import { Metadata } from 'next';

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

export const metadata: Metadata = {
  title: `新增伺服器 | Discord伺服器列表 - DiscordHubs`,
  description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此新增你的伺服器，讓你的伺服器得到宣傳和管理，快速建立專屬的社群空間。`,
  icons: {
    icon: '/favicon.ico',
  },
  // 關鍵詞
  keywords: keywords.join('，'),
  // 作者的信息
  authors: [
    {
      name: 'DiscordHubs 團隊',
      url: 'https://dchubs.org',
    },
  ],
  // 社交媒體分享優化
  metadataBase: new URL('https://dchubs.org'),
  openGraph: {
    title: `新增伺服器 | DiscordHubs`,
    description: `在 DiscordHubs 上架你的 Discord 中文伺服器，提升曝光度、吸引更多成員，打造專屬高互動社群。`,
    url: 'https://dchubs.org',
    siteName: 'DiscordHubs',
    images: [
      {
        url: '/DCHUSB_banner.png',
        width: 1012,
        height: 392,
        alt: 'DiscordHubs-banner',
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
    return redirect('/api/auth/signin?callbackUrl=/add-server');
  }

  const { activeServers, inactiveServers } = await getUserGuildsWithBotStatus(
    session.access_token,
  );

  // ✅ 加入 isPublished 判斷
  const activeWithStatus = await Promise.all(
    activeServers.map(async server => {
      const isPublished = await getServerByGuildId(server.id).then(Boolean);

      return {
        ...server,
        isPublished,
      };
    }),
  );

  return (
    <ServerClient
      activeServers={activeWithStatus}
      inactiveServers={inactiveServers}
    />
  );
}
