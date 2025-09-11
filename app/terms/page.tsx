import { GetbaseUrl } from '@/lib/utils';
import { ScrollText, ChevronRight } from 'lucide-react';
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
  'DiscordHubs 服務條款',
  'DiscordHubs 條款',
  'DiscordHubs 使用條款',
];

export const dynamic = 'force-static';

function resolveMetadataBase(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dchubs.org');
  } catch {
    return new URL('https://dchubs.org');
  }
}

export const metadata: Metadata = {
  title: `服務條款 | Discord伺服器列表 - DiscordHubs`,
  description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此了解 DiscordHubs 平台的服務使用條款和內容`,
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
    title: `服務條款 | Discord伺服器列表 - DiscordHubs`,
    description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此了解 DiscordHubs 平台的服務使用條款和內容`,
    url: 'https://dchubs.org/terms',
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
    title: '服務條款 | Discord伺服器列表 - DiscordHubs',
    description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此了解 DiscordHubs 平台的服務使用條款和內容`,
    images: ['/dchub.png'],
  },
};

export default function TermsPage() {
  const baseUrl = GetbaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Discord伺服器列表',
    description: 'DiscordHubs平台的服務使用條款說明',
    url: `${baseUrl}/terms`,
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
          name: '服務條款',
          item: `${baseUrl}/terms`,
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
      <div className="min-h-screen bg-[#1e1f22] text-white">
        <div className="bg-[#2b2d31] py-12 border-b border-[#1e1f22]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <ScrollText size={48} className="text-[#5865f2]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              使用條款
            </h1>
            <p className="text-lg text-gray-300">
              最後更新日期：2025 年 4 月 16 日
            </p>
          </div>
        </div>

        {/* 主要內容*/}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-[#2b2d31] rounded-lg p-6 md:p-8 shadow-lg">
            {/* 目錄 */}
            <div className="mb-8 p-4 bg-[#36393f] rounded-lg border border-[#1e1f22]">
              <h2 className="text-xl font-bold mb-4">目錄</h2>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#introduction"
                    className="flex items-center text-[#5865f2] hover:underline"
                  >
                    <ChevronRight size={16} className="mr-2" />
                    <span>1. 簡介</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
