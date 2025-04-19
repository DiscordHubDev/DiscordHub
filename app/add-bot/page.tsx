import AddBotPageClient from './client';
import { Metadata } from 'next';

const keywords = [
  '新增 Discord 機器人',
  'Discord 機器人添加',
  '創建 Discord 機器人',
  'Discord 伺服器列表',
  '熱門 Discord 伺服器',
  '免費 Discord 伺服器',
  '人氣 Discord 伺服器',
  'Discord 機器人推薦',
  '大型 Discord 機器人',
  '小型 Discord 機器人',
  '公開 Discord 機器人',
];

export const metadata: Metadata = {
  title: `新增機器人 | Discord機器人列表 - DiscordHubs`,
  description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此新增你的機器人，讓你的機器人得到宣傳和管理，快速建立專屬的機器人空間。`,
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
    title: `新增機器人 | Discord機器人列表 - DiscordHubs`,
    description:
      '在 DiscordHubs 新增你的機器人，獲得更多曝光與管理功能，輕鬆打造專屬機器人頁面，讓更多用戶發現並使用你的機器人。',
    url: 'https://dchubs.org',
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
    card: 'summary_large_image',
    title: `新增機器人 | Discord機器人列表 - DiscordHubs`,
    description:
      '在 DiscordHubs 新增你的機器人，獲得更多曝光與管理功能，輕鬆打造專屬機器人頁面，讓更多用戶發現並使用你的機器人。',
    images: ['/dchub.png'],
  },
};

export default async function AddBotPage() {
  return <AddBotPageClient />;
}
