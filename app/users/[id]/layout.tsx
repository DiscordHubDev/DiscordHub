import { getUserById } from '@/lib/actions/user';
import type { Metadata } from 'next';

export const dynamicParams = true;
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserById(id);
  const ogImages = [];

  if (user?.avatar) {
    ogImages.push({
      url: user.avatar,
      width: 80,
      height: 80,
      alt: 'user-icon',
    });
  } else {
    ogImages.push({
      url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      width: 80,
      height: 80,
      alt: 'user-icon',
    });
  }

  if (user?.banner) {
    ogImages.push({
      url: user.banner,
      width: 960,
      height: 540,
      alt: 'user-banner',
    });
  }
  if (!user) {
    return { title: '用戶未找到 | DiscordHubs' };
  }

  return {
    title: `${user.username} | DiscordHubs`,
    description: `${user.username} 的個人頁面`,
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      title: `${user.username} 的個人頁面`,
      description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此管理你的伺服器和機器人，讓你的伺服器得到宣傳和管理，編輯你的個人資料和管理收藏。`,
      url: 'https://dchubs.org',
      siteName: 'DiscordHubs',
      images: ogImages,
      locale: 'zh-TW',
      type: 'website',
    },
  };
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
