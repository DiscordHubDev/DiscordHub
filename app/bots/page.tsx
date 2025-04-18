import { getAllBots } from '@/lib/actions/bots';
import DiscordBotListPageClient from './discord-bot-list';
import type { Metadata } from 'next';

const keywords = [
  '熱門 Discord機器人',
  '免費 Discord機器人',
  'Discord 管理機器人',
  'Discord 音樂機器人',
  'Discord 伺服器列表',
  'Discord 機器人列表',
  'Discord 列表平台',
  'Discord 宣傳平台',
];

export const metadata: Metadata = {
  title: `熱門機器人 | Discord機器人列表 - DiscordHubs`,
  description: `歡迎來到 DiscordHubs 平台，這裏擁有熱門 Discord 機器人，涵蓋免費的管理機器人、超棒的音樂機器人、遊戲實用機器人等，具有不同的標籤及分類。同時，我們提供全面的 Discord 伺服器列表，幫助您輕鬆發現、宣傳和加入各類有趣的社群群組，`,
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
    title: `熱門機器人 | Discord機器人列表 - DiscordHubs`,
    description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，幫助您發現及宣傳伺服器，和加入有趣的社群群組和機器人，為伺服器增添功能和成員。`,
    url: 'https://dchubs.org',
    siteName: 'DiscordHubs',
    images: [
      {
        url: '/DCHUSB_banner.png',
        width: 1012,
        height: 392,
        alt: 'DiscordHubs-banner',
      },
      {
        url: '/dchub.png',
        width: 80,
        height: 80,
        alt: 'DiscordHubs-icon',
      },
    ],
    locale: 'zh-TW',
    type: 'website',
  },
};

export const revalidate = 3600;

export default async function DiscordBotListPage() {
  const allBots = await getAllBots();
  return <DiscordBotListPageClient allBots={allBots} />;
}
