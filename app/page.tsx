import { getAllServers } from '@/lib/actions/servers';
import type React from 'react';
import DiscordServerListPageClient from './client';
import type { Metadata } from 'next';

const keywords = [
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
  title: `熱門伺服器 | Discord伺服器列表 - DiscordHubs`,
  description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，幫助您發現及宣傳伺服器，和加入有趣的社群群組和機器人，為伺服器增添功能和成員。`,
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
    title: `熱門伺服器 | Discord伺服器列表 - DiscordHubs`,
    description: `DiscordHubs 是最優質的 Discord 中文伺服器與機器人列表平台，幫助你探索有趣社群、宣傳伺服器，並加入實用機器人，豐富你的伺服器功能與成員互動。`,
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
    title: `熱門伺服器 | Discord伺服器列表 - DiscordHubs`,
    description: `DiscordHubs 是最優質的 Discord 中文伺服器與機器人列表平台，幫助你探索有趣社群、宣傳伺服器，並加入實用機器人，豐富你的伺服器功能與成員互動。`,
    images: ['/dchub.png'],
  },
};

export default async function DiscordServerListPage() {
  const servers = await getAllServers();
  return (
    <>
      <DiscordServerListPageClient servers={servers} />
    </>
  );
}
