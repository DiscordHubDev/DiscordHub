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
      images: user.avatar ? [user.avatar] : [],
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
