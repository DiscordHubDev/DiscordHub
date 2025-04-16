import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChevronRight,
  BookOpen,
  Server,
  Bot,
  User,
  Heart,
  Search,
  Plus,
  ArrowRight,
} from 'lucide-react';
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
  'DiscordHubs 幫助頁面',
  'DiscordHubs 教學頁面',
  'DiscordHubs 使用教學',
];

export const metadata: Metadata = {
  title: `使用教學 | Discord伺服器列表 - DiscordHubs`,
  description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此了解如何充分利用及使用 DiscordHubs 平台，探索伺服器、機器人，以及管理您的內容`,
  icons: {
    icon: '/dchub.ico',
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
    title: `使用教學 | Discord伺服器列表 - DiscordHubs`,
    description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此了解如何充分利用及使用 DiscordHubs 平台，探索伺服器、機器人，以及管理您的內容`,
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

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      <div className="relative bg-gradient-to-r from-[#5865f2] to-[#8c54ff] py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 800 800">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="800" height="800" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <BookOpen size={48} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            使用教學
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            了解如何充分利用及使用 DiscordHubs
            平台，探索伺服器、機器人，以及管理您的內容
          </p>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 小小Sidebar拿捏了 */}
          <div className="lg:col-span-1">
            <div className="bg-[#2b2d31] rounded-lg p-5 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">目錄</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#getting-started"
                    className="flex items-center text-gray-300 hover:text-white py-1"
                  >
                    <ChevronRight size={16} className="mr-2 text-[#5865f2]" />
                    <span>開始使用</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#finding-servers"
                    className="flex items-center text-gray-300 hover:text-white py-1"
                  >
                    <ChevronRight size={16} className="mr-2 text-[#5865f2]" />
                    <span>尋找伺服器</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#finding-bots"
                    className="flex items-center text-gray-300 hover:text-white py-1"
                  >
                    <ChevronRight size={16} className="mr-2 text-[#5865f2]" />
                    <span>尋找機器人</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#adding-content"
                    className="flex items-center text-gray-300 hover:text-white py-1"
                  >
                    <ChevronRight size={16} className="mr-2 text-[#5865f2]" />
                    <span>新增內容</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#managing-profile"
                    className="flex items-center text-gray-300 hover:text-white py-1"
                  >
                    <ChevronRight size={16} className="mr-2 text-[#5865f2]" />
                    <span>管理個人資料</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#voting"
                    className="flex items-center text-gray-300 hover:text-white py-1"
                  >
                    <ChevronRight size={16} className="mr-2 text-[#5865f2]" />
                    <span>投票系統</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="flex items-center text-gray-300 hover:text-white py-1"
                  >
                    <ChevronRight size={16} className="mr-2 text-[#5865f2]" />
                    <span>常見問題</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* 主要內容 */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="guides" className="mb-8">
              <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full">
                <TabsTrigger
                  value="guides"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  使用指南
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  教學影片
                </TabsTrigger>
                <TabsTrigger
                  value="tips"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  使用技巧
                </TabsTrigger>
              </TabsList>

              <TabsContent value="guides" className="mt-6">
                {/* 開始使用 */}
                <section id="getting-started" className="mb-12">
                  <div className="flex items-center mb-4">
                    <BookOpen size={24} className="mr-3 text-[#5865f2]" />
                    <h2 className="text-2xl font-bold">開始使用</h2>
                  </div>
                  <div className="bg-[#2b2d31] rounded-lg p-6 mb-6">
                    <p className="text-gray-300 mb-4">
                      歡迎你來到 DiscordHubs！我們的平台旨在幫助您發現最棒的
                      Discord 伺服器和機器人。以下是開始使用我們平台的基本步驟：
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card className="bg-[#36393f] border-[#1e1f22]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-white flex items-center">
                            <span className="bg-[#5865f2] w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">
                              1
                            </span>
                            創建帳號
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-300 text-sm">
                          在左上角或在菜單中找到登入按鈕，並使用您的 Discord
                          帳號進行登入，無需額外註冊步驟，快速又方便。
                        </CardContent>
                      </Card>
                      <Card className="bg-[#36393f] border-[#1e1f22]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-white flex items-center">
                            <span className="bg-[#5865f2] w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">
                              2
                            </span>
                            探索內容
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-300 text-sm">
                          瀏覽我們豐富的伺服器和機器人列表，使用分類標籤或關鍵字找到您感興趣的內容。最後收藏你喜愛的內容
                        </CardContent>
                      </Card>
                      <Card className="bg-[#36393f] border-[#1e1f22]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-white flex items-center">
                            <span className="bg-[#5865f2] w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">
                              3
                            </span>
                            加入互動
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-300 text-sm">
                          加入伺服器、邀請機器人、投票支持您喜愛的內容，並分享您自己的伺服器或機器人。
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </section>

                {/* 尋找伺服器 */}
                <section id="finding-servers" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Server size={24} className="mr-3 text-[#5865f2]" />
                    <h2 className="text-2xl font-bold">尋找伺服器</h2>
                  </div>
                  <div className="bg-[#2b2d31] rounded-lg p-6">
                    <p className="text-gray-300 mb-4">
                      我們的平台提供多種方式幫助您找到理想的 Discord
                      伺服器。以下是一些尋找伺服器的小建議：
                    </p>
                    <div className="space-y-4 mt-6">
                      <div className="flex items-start">
                        <div className="bg-[#5865f2] p-2 rounded-lg mr-4 flex-shrink-0">
                          <Search size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white mb-1">
                            使用搜尋功能
                          </h3>
                          <p className="text-gray-300 text-sm">
                            在搜尋欄中輸入關鍵字，快速找到與您興趣相符的伺服器。您可以搜尋伺服器名稱、描述或標籤。
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-[#5865f2] p-2 rounded-lg mr-4 flex-shrink-0">
                          <Server size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white mb-1">
                            瀏覽分類
                          </h3>
                          <p className="text-gray-300 text-sm">
                            使用側邊欄的分類標籤，根據您的興趣（如遊戲、音樂、藝術等）瀏覽伺服器。
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-[#5865f2] p-2 rounded-lg mr-4 flex-shrink-0">
                          <Heart size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white mb-1">
                            查看熱門伺服器
                          </h3>
                          <p className="text-gray-300 text-sm">
                            在「熱門伺服器」類別，您可以找到最受歡迎的伺服器，這些伺服器通常有活躍的社群和豐富的內容。
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-[#36393f] rounded-lg border border-[#1e1f22]">
                      <h4 className="font-medium text-white mb-2">
                        溫馨小提示
                      </h4>
                      <p className="text-gray-300 text-sm">
                        點擊伺服器卡片可以查看詳細資訊，包括伺服器描述、規則、成員數量和截圖等。這有助於您在加入前更好地了解伺服器。
                      </p>
                    </div>
                  </div>
                </section>

                {/* 尋找機器人 */}
                <section id="finding-bots" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Bot size={24} className="mr-3 text-[#5865f2]" />
                    <h2 className="text-2xl font-bold">尋找機器人</h2>
                  </div>
                  <div className="bg-[#2b2d31] rounded-lg p-6">
                    <p className="text-gray-300 mb-4">
                      Discord
                      機器人可以為您的伺服器增添各種功能。以下是在我們平台上尋找理想機器人的建議：
                    </p>
                    <div className="space-y-4 mt-6">
                      <div className="flex items-start">
                        <div className="bg-[#5865f2] p-2 rounded-lg mr-4 flex-shrink-0">
                          <Search size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white mb-1">
                            搜尋特定功能
                          </h3>
                          <p className="text-gray-300 text-sm">
                            使用搜尋功能尋找具有特定功能的機器人，例如「音樂」、「管理」或「遊戲」等關鍵字。
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-[#5865f2] p-2 rounded-lg mr-4 flex-shrink-0">
                          <Bot size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white mb-1">
                            按類別瀏覽
                          </h3>
                          <p className="text-gray-300 text-sm">
                            使用機器人頁面上的分類標籤，根據機器人的功能類型（如音樂、管理、遊戲等）進行瀏覽。
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-[#5865f2] p-2 rounded-lg mr-4 flex-shrink-0">
                          <Heart size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white mb-1">
                            查看精選機器人
                          </h3>
                          <p className="text-gray-300 text-sm">
                            在「精選機器人」標籤下，您可以找到一些擁有1000伺服器以上的高質量機器人，這些機器人通常更可靠且功能豐富。
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-[#36393f] rounded-lg border border-[#1e1f22]">
                      <h4 className="font-medium text-white mb-2">提示</h4>
                      <p className="text-gray-300 text-sm">
                        在機器人詳情頁面，您可以查看機器人的指令列表、功能說明和使用示例。這有助於您了解機器人的使用方法和是否符合您的需求。
                      </p>
                    </div>
                  </div>
                </section>

                {/* 新增內容 */}
                <section id="adding-content" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Plus size={24} className="mr-3 text-[#5865f2]" />
                    <h2 className="text-2xl font-bold">新增內容</h2>
                  </div>
                  <div className="bg-[#2b2d31] rounded-lg p-6">
                    <p className="text-gray-300 mb-4">
                      想要在我們的平台上分享您的 Discord
                      伺服器或機器人嗎？以下是新增內容的步驟：
                    </p>
                    <div className="space-y-6 mt-6">
                      <div className="bg-[#36393f] rounded-lg p-5 border border-[#1e1f22]">
                        <h3 className="font-medium text-white mb-3 flex items-center">
                          <Server size={18} className="mr-2 text-[#5865f2]" />
                          新增伺服器
                        </h3>
                        <ol className="space-y-3 text-gray-300 text-sm pl-6 list-decimal">
                          <li>登入您的帳號</li>
                          <li>點擊頂部導航欄或菜單的「新增伺服器」按鈕</li>
                          <li>
                            填寫伺服器資訊，包括名稱、描述、標籤和邀請連結
                          </li>
                          <li>上傳伺服器相關圖片（可選）</li>
                          <li>提交表單即可發佈</li>
                        </ol>
                        <div className="mt-6 p-4 bg-[#2a2a2c] rounded-lg border border-[#1e1f22]">
                          <h4 className="font-medium text-white mb-2">
                            溫馨小提示
                          </h4>
                          <p className="text-gray-300 text-sm">
                            發佈自己的伺服器需要邀請我們的官方機器人DCHUB，以獲取你位於的伺服器及確認你的權限
                          </p>
                        </div>
                        <div className="mt-4">
                          <Link href="/add-server">
                            <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                              新增伺服器
                              <ArrowRight size={16} className="ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="bg-[#36393f] rounded-lg p-5 border border-[#1e1f22]">
                        <h3 className="font-medium text-white mb-3 flex items-center">
                          <Bot size={18} className="mr-2 text-[#5865f2]" />
                          新增機器人
                        </h3>
                        <ol className="space-y-3 text-gray-300 text-sm pl-6 list-decimal">
                          <li>登入您的帳號</li>
                          <li>點擊頂部導航欄或菜單的「新增機器人」按鈕</li>
                          <li>
                            填寫機器人資訊，包括名稱、描述、前綴、標籤和邀請連結
                          </li>
                          <li>添加機器人的指令列表和功能說明</li>
                          <li>上傳機器人相關圖片（可選）</li>
                          <li>提交表單等待審核</li>
                        </ol>
                        <div className="mt-4">
                          <Link href="/add-bot">
                            <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                              新增機器人
                              <ArrowRight size={16} className="ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 管理個人資料 */}
                <section id="managing-profile" className="mb-12">
                  <div className="flex items-center mb-4">
                    <User size={24} className="mr-3 text-[#5865f2]" />
                    <h2 className="text-2xl font-bold">管理個人資料</h2>
                  </div>
                  <div className="bg-[#2b2d31] rounded-lg p-6">
                    <p className="text-gray-300 mb-4">
                      在個人資料頁面，您可以管理您的帳號資訊、查看您的伺服器和機器人，以及管理您的收藏。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="bg-[#36393f] rounded-lg p-5 border border-[#1e1f22]">
                        <h3 className="font-medium text-white mb-3">
                          個人資訊
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                          您可以在個人資料頁面編輯您的個人資訊，包括用戶名、個人簡介和社交媒體連結。
                        </p>
                        <Link href="/profile">
                          <Button
                            variant="outline"
                            className="border-[#5865f2] text-[#5865f2] hover:bg-[#5865f2] hover:text-white"
                          >
                            前往個人資料
                          </Button>
                        </Link>
                      </div>
                      <div className="bg-[#36393f] rounded-lg p-5 border border-[#1e1f22]">
                        <h3 className="font-medium text-white mb-3">
                          內容管理
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                          在個人資料頁面，您可以查看和管理您添加的伺服器和機器人，以及您收藏的內容。
                        </p>
                        <Link href="/profile">
                          <Button
                            variant="outline"
                            className="border-[#5865f2] text-[#5865f2] hover:bg-[#5865f2] hover:text-white"
                          >
                            管理我的內容
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 投票系統 */}
                <section id="voting" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Heart size={24} className="mr-3 text-[#5865f2]" />
                    <h2 className="text-2xl font-bold">投票系統</h2>
                  </div>
                  <div className="bg-[#2b2d31] rounded-lg p-6">
                    <p className="text-gray-300 mb-4">
                      我們的投票系統可以讓用戶支持他們喜愛的伺服器和機器人。以下是關於投票系統的重要資訊：
                    </p>
                    <div className="space-y-4 mt-6">
                      <div className="bg-[#36393f] rounded-lg p-4 border border-[#1e1f22]">
                        <h3 className="font-medium text-white mb-2">
                          如何投票
                        </h3>
                        <p className="text-gray-300 text-sm">
                          在伺服器或機器人的詳情頁面，您可以找到「投票」按鈕。點擊該按鈕即可為該伺服器或機器人投票。
                        </p>
                      </div>
                      <div className="bg-[#36393f] rounded-lg p-4 border border-[#1e1f22]">
                        <h3 className="font-medium text-white mb-2">
                          投票冷卻時間
                        </h3>
                        <p className="text-gray-300 text-sm">
                          每個伺服器或機器人每 12
                          小時只能投一次票。投票後，您需要等待冷卻時間結束才能再次投票。
                        </p>
                      </div>
                      <div className="bg-[#36393f] rounded-lg p-4 border border-[#1e1f22]">
                        <h3 className="font-medium text-white mb-2">
                          投票的重要性
                        </h3>
                        <p className="text-gray-300 text-sm">
                          投票可以幫助優質的伺服器和機器人獲得更多曝光，出現在排行榜列表中等等，讓更多用戶發現它們。
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Link href="/servers/1297055626014490695">
                        <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                          點我前往可投票的頁面
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </section>

                {/* 常見問題 */}
                <section id="faq" className="mb-12">
                  <div className="flex items-center mb-4">
                    <BookOpen size={24} className="mr-3 text-[#5865f2]" />
                    <h2 className="text-2xl font-bold">常見問題</h2>
                  </div>
                  <div className="bg-[#2b2d31] rounded-lg p-6">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem
                        value="item-1"
                        className="border-[#1e1f22]"
                      >
                        <AccordionTrigger className="text-white hover:no-underline">
                          頁面中那些熱門、精選、票選、最新等都是什麼意思？代表什麼呀
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          以下是我們平台暫定對於分類的顯示條件，每個類別都有一定排序條件（適用於伺服器或機器人），例如：
                          <ul className="list-disc list-inside mt-2">
                            <li>
                              熱門：是以社群成員或機器人擁有伺服器數量進行降序排序。
                            </li>
                          </ul>
                          <ul className="list-disc list-inside mt-2">
                            <li>
                              精選：是以社群成員或機器人擁有伺服器數量，以及擁有的投票數進行降序排序。
                            </li>
                          </ul>
                          <ul className="list-disc list-inside mt-2">
                            <li>
                              票選：是以該社群或機器人擁有的投票數進行降序排序。
                            </li>
                          </ul>
                          <ul className="list-disc list-inside mt-2">
                            <li>
                              最新：是以社群或機器人在平台推出發佈的時間進行升序排序。
                            </li>
                          </ul>
                          <ul className="list-disc list-inside mt-2">
                            <li>
                              已驗證：是以機器人是否獲得官方驗證，及在平台推出發佈的時間進行升序排序。
                            </li>
                          </ul>
                          <ul className="list-disc list-inside mt-2">
                            <li>
                              所有：是以本平台所有收錄的社群或機器人，的推出發佈的時間進行降序排序。
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-2"
                        className="border-[#1e1f22]"
                      >
                        <AccordionTrigger className="text-white hover:no-underline">
                          我需要付費才能使用 DiscordHubs 嗎？
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          不需要，DiscordHubs
                          是完全免費的平台。您可以免費瀏覽、添加伺服器和機器人，以及使用所有功能。
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-3"
                        className="border-[#1e1f22]"
                      >
                        <AccordionTrigger className="text-white hover:no-underline">
                          我的伺服器或機器人需要多久才能被審核通過？
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          通常情況下，我們會在 1-2
                          個工作日內完成審核，當然也基於我們內部情況，比較忙的話可能要等待上7天，如果很久也沒有任何通知，可以到我們官方群組開啟客服單查詢，煩請用戶耐心等到感謝！
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-4"
                        className="border-[#1e1f22]"
                      >
                        <AccordionTrigger className="text-white hover:no-underline">
                          為什麼我的伺服器或機器人被拒絕了？
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          可能的原因包括：違反我們或Discord官方的社群準則、提供的資訊不完整、邀請連結無效，或內容不適合。您可以修改後重新提交。
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-5"
                        className="border-[#1e1f22]"
                      >
                        <AccordionTrigger className="text-white hover:no-underline">
                          如何提高我的伺服器或機器人在列表中的排名？
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          獲得更多的投票或置頂是提高排名的主要方式。您可以邀請您的社群成員為您的伺服器或機器人投票以及置頂，每
                          12 小時可投一次票或置頂。
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-6"
                        className="border-[#1e1f22]"
                      >
                        <AccordionTrigger className="text-white hover:no-underline">
                          如何更新我的伺服器或機器人資訊？
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          登入後，前往您的個人資料頁面，在「我的伺服器」或「我的機器人」標籤下，點擊「管理」按鈕即可編輯相關資訊。
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-7"
                        className="border-[#1e1f22]"
                      >
                        <AccordionTrigger className="text-white hover:no-underline">
                          我怎麼知道我的機器人是否通過審核了？
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          你可以在左上角找到一本小書，在此處下方可以找到私人收件匣，點擊可以打開並查看你的郵件，無論通過還是被拒絕皆會有通知，又或者到官方群組的資訊區查看相關資訊
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="videos" className="mt-6">
                <div className="bg-[#2b2d31] rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-6">教學影片</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#36393f] rounded-lg overflow-hidden border border-[#1e1f22]">
                      <div className="aspect-video w-full">
                        <iframe
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                          title="DiscordHubs 平台介紹"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-2">
                          DiscordHubs 平台介紹
                        </h3>
                        <p className="text-gray-300 text-sm">
                          了解 DiscordHubs
                          平台的基本功能和使用方法。（教學影片製作中請等待更新）
                        </p>
                      </div>
                    </div>
                    <div className="bg-[#36393f] rounded-lg overflow-hidden border border-[#1e1f22]">
                      <div className="aspect-video w-full">
                        <iframe
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                          title="DiscordHubs 平台介紹"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-2">
                          如何添加伺服器
                        </h3>
                        <p className="text-gray-300 text-sm">
                          詳細介紹如何在 DiscordHubs 上添加和推廣您的 Discord
                          伺服器。（教學影片製作中請等待更新）
                        </p>
                      </div>
                    </div>
                    <div className="bg-[#36393f] rounded-lg overflow-hidden border border-[#1e1f22]">
                      <div className="aspect-video w-full">
                        <iframe
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                          title="DiscordHubs 平台介紹"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-2">
                          如何添加機器人
                        </h3>
                        <p className="text-gray-300 text-sm">
                          詳細介紹如何在 DiscordHubs 上添加和推廣您的 Discord
                          機器人。（教學影片製作中請等待更新）
                        </p>
                      </div>
                    </div>
                    <div className="bg-[#36393f] rounded-lg overflow-hidden border border-[#1e1f22]">
                      <div className="aspect-video w-full">
                        <iframe
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                          title="DiscordHubs 平台介紹"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-2">
                          投票系統使用教學
                        </h3>
                        <p className="text-gray-300 text-sm">
                          了解如何使用投票系統支持您喜愛的伺服器和機器人。（教學影片製作中請等待更新）
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tips" className="mt-6">
                <div className="bg-[#2b2d31] rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-6">使用技巧</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-[#36393f] border-[#1e1f22]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white">
                          優化您的伺服器描述
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          提高曝光率的關鍵
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-gray-300">
                        <p className="mb-4">
                          撰寫清晰、吸引人的伺服器描述是吸引新成員的關鍵。確保包含以下要素：
                        </p>
                        <ul className="space-y-2 list-disc pl-5">
                          <li>簡潔明了地說明伺服器的主題和目的</li>
                          <li>突出伺服器的獨特特色和活動</li>
                          <li>提及伺服器的社群氛圍和規則</li>
                          <li>使用相關關鍵詞，幫助用戶在搜尋時找到您</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#36393f] border-[#1e1f22]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white">
                          選擇合適的標籤
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          讓目標用戶更容易找到您
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-gray-300">
                        <p className="mb-4">
                          標籤是用戶尋找伺服器和機器人的重要方式。選擇標籤時請注意：
                        </p>
                        <ul className="space-y-2 list-disc pl-5">
                          <li>選擇最能代表您內容的標籤</li>
                          <li>不要選擇過多不相關的標籤</li>
                          <li>考慮您的目標受眾會搜尋哪些標籤</li>
                          <li>定期更新標籤以反映內容的變化</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#36393f] border-[#1e1f22]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white">
                          上傳高質量的圖片
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          視覺吸引力的重要性
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-gray-300">
                        <p className="mb-4">
                          高質量的圖片可以大大提升您的伺服器或機器人的吸引力：
                        </p>
                        <ul className="space-y-2 list-disc pl-5">
                          <li>使用清晰、高解析度的圖標和橫幅</li>
                          <li>選擇能反映內容主題的圖片</li>
                          <li>上傳多張展示伺服器或機器人特色的截圖</li>
                          <li>確保圖片符合建議的尺寸要求</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#36393f] border-[#1e1f22]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white">
                          定期更新內容
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          保持資訊的準確性和新鮮度
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-gray-300">
                        <p className="mb-4">
                          定期更新您的伺服器或機器人資訊可以提高用戶參與度：
                        </p>
                        <ul className="space-y-2 list-disc pl-5">
                          <li>確保所有連結和邀請都是有效的</li>
                          <li>更新描述以反映最新的功能和活動</li>
                          <li>添加新的截圖展示最新內容</li>
                          <li>留意我們官方的更新或通知</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
