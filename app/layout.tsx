import './globals.css';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';

import { ThemeProvider } from '@/components/theme-provider';
import SessionProvider from './providers/SessionProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils';

import ClientLayout from './client_layout';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

import type { Metadata } from 'next';

const keywords = [
  '熱門 Discord 伺服器',
  '中文 Discord 伺服器',
  'Discord 社群推薦',
  'Discord 伺服器排行',
  '有趣 Discord 群組',
  '免費 Discord 社群',
  '伺服器人氣推薦',
  'DiscordHubs 熱門伺服器',
];

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://dchubs.org';

  return {
    title: '熱門伺服器 | Discord伺服器列表 - DiscordHubs',
    description:
      'DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，幫助您發現及宣傳伺服器，和加入有趣的社群群組和機器人，為伺服器增添功能和成員。',
    icons: {
      icon: '/favicon.ico',
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
      title: '熱門伺服器 | Discord伺服器列表 - DiscordHubs',
      description:
        'DiscordHubs 是最優質的 Discord 中文伺服器與機器人列表平台，幫助你探索有趣社群、宣傳伺服器，並加入實用機器人，豐富你的伺服器功能與成員互動。',
      url: 'https://dchubs.org',
      siteName: 'DiscordHubs',
      images: [
        {
          url: '/dchub.png',
          alt: 'DiscordHubs Discord伺服器及機器人列表',
        },
      ],
      locale: 'zh-TW',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: '熱門伺服器 | Discord伺服器列表 - DiscordHubs',
      description:
        'DiscordHubs 是最優質的 Discord 中文伺服器與機器人列表平台，幫助你探索有趣社群、宣傳伺服器，並加入實用機器人，豐富你的伺服器功能與成員互動。',
      images: ['/dchub.png'],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={cn(
          'h-screen w-full font-sans antialiased bg-[#1e1f22] text-white',
          fontSans.variable,
        )}
      >
        <SidebarProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SessionProvider session={session}>
              <ClientLayout>{children}</ClientLayout>
            </SessionProvider>
          </ThemeProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
