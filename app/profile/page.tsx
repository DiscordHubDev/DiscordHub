import { redirect } from 'next/navigation';
import UserProfile from '@/components/UserProfile';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

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
  'Discord 管理伺服器',
  'Discord 個人檔案',
];

export const metadata: Metadata = {
  title: `個人檔案 | Discord伺服器列表 - DiscordHubs`,
  description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此管理你的伺服器和機器人，讓你的伺服器得到宣傳和管理，編輯你的個人資料和管理收藏。`,
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dchubs.org',
  ),
  openGraph: {
    title: `個人檔案 | Discord伺服器列表 - DiscordHubs`,
    description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此管理你的伺服器和機器人，讓你的伺服器得到宣傳和管理，編輯你的個人資料和管理收藏。`,
    url: 'https://dchubs.org',
    siteName: 'DiscordHubs',
    images: [
      {
        url: '/DCHUSB_banner.png',
        width: 1012,
        height: 392,
        alt: 'DiscordHubs Discord伺服器及機器人列表',
      },
    ],
    locale: 'zh-TW',
    type: 'website',
  },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.discordProfile) {
    return redirect('/api/auth/signin/discord?callbackUrl=/profile');
  }
  const tokensData = await prisma.apiToken.findFirst({
    where: { userId: session?.discordProfile?.id },
  });

  const tokens = tokensData
    ? {
        accessToken: tokensData.accessToken,
        refreshToken: tokensData.refreshToken,
      }
    : undefined;

  return <UserProfile tokens={tokens} />;
}
