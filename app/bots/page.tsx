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
  description: `歡迎來到 DiscordHubs，這裡網羅熱門 Discord 中文機器人，包含免費管理工具、優質音樂機器人與實用遊戲機器人，依標籤與分類輕鬆探索。同時提供完整伺服器導覽，協助您發現、宣傳並加入各類精彩社群。`,
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
    title: `熱門機器人推薦 | 精選 Discord 中文機器人 - DiscordHubs`,
    description: `DiscordHubs 是最佳的 Discord 中文伺服器與機器人列表平台，協助您探索與宣傳伺服器，加入喜愛的機器人來為伺服器增添功能與活躍成員。`,
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
    title: `熱門機器人推薦 | 精選 Discord 中文機器人 - DiscordHubs`,
    description: `DiscordHubs 是最佳的 Discord 中文伺服器與機器人列表平台，協助您探索與宣傳伺服器，加入喜愛的機器人來為伺服器增添功能與活躍成員。`,
    images: ['/dchub.png'],
  },
};

export const revalidate = 3600;

export default async function DiscordBotListPage() {
  const allBots = await getAllBots();
  return <DiscordBotListPageClient allBots={allBots} />;
}
