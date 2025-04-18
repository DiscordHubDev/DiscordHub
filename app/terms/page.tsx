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

export const metadata: Metadata = {
  title: `服務條款 | Discord伺服器列表 - DiscordHubs`,
  description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此了解 DiscordHubs 平台的服務使用條款和內容`,
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
    title: `服務條款 | Discord伺服器列表 - DiscordHubs`,
    description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此了解 DiscordHubs 平台的服務使用條款和內容`,
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
    title: '服務條款 | Discord伺服器列表 - DiscordHubs',
    description: `DiscordHubs是最佳的 Discord 中文伺服器和機器人列表平台，你可以在此了解 DiscordHubs 平台的服務使用條款和內容`,
    images: ['/dchub.png'],
  },
};

export default function TermsPage() {
  return (
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
              <li>
                <a
                  href="#use-of-service"
                  className="flex items-center text-[#5865f2] hover:underline"
                >
                  <ChevronRight size={16} className="mr-2" />
                  <span>2. 服務使用</span>
                </a>
              </li>
              <li>
                <a
                  href="#account"
                  className="flex items-center text-[#5865f2] hover:underline"
                >
                  <ChevronRight size={16} className="mr-2" />
                  <span>3. 帳號</span>
                </a>
              </li>
              <li>
                <a
                  href="#content"
                  className="flex items-center text-[#5865f2] hover:underline"
                >
                  <ChevronRight size={16} className="mr-2" />
                  <span>4. 用戶內容</span>
                </a>
              </li>
              <li>
                <a
                  href="#prohibited"
                  className="flex items-center text-[#5865f2] hover:underline"
                >
                  <ChevronRight size={16} className="mr-2" />
                  <span>5. 禁止行為</span>
                </a>
              </li>
              <li>
                <a
                  href="#termination"
                  className="flex items-center text-[#5865f2] hover:underline"
                >
                  <ChevronRight size={16} className="mr-2" />
                  <span>6. 終止</span>
                </a>
              </li>
              <li>
                <a
                  href="#disclaimer"
                  className="flex items-center text-[#5865f2] hover:underline"
                >
                  <ChevronRight size={16} className="mr-2" />
                  <span>7. 免責聲明</span>
                </a>
              </li>
              <li>
                <a
                  href="#limitation"
                  className="flex items-center text-[#5865f2] hover:underline"
                >
                  <ChevronRight size={16} className="mr-2" />
                  <span>8. 責任限制</span>
                </a>
              </li>
              <li>
                <a
                  href="#changes"
                  className="flex items-center text-[#5865f2] hover:underline"
                >
                  <ChevronRight size={16} className="mr-2" />
                  <span>9. 條款變更</span>
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="flex items-center text-[#5865f2] hover:underline"
                >
                  <ChevronRight size={16} className="mr-2" />
                  <span>10. 鏈結其他網站</span>
                </a>
              </li>
              <li>
                <a
                  href="#link"
                  className="flex items-center text-[#5865f2] hover:underline"
                >
                  <ChevronRight size={16} className="mr-2" />
                  <span>11. 隱私權條款</span>
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="flex items-center text-[#5865f2] hover:underline"
                >
                  <ChevronRight size={16} className="mr-2" />
                  <span>12. 聯絡我們</span>
                </a>
              </li>
            </ul>
          </div>

          {/* 條款內容 */}
          <div className="space-y-8 text-gray-300">
            <section id="introduction">
              <h2 className="text-2xl font-bold text-white mb-4">1. 簡介</h2>
              <p className="mb-4">
                歡迎使用 DiscordHubs（以下簡稱「我們」、「本服務」或「本平台」）
                而用戶（簡稱「您」、「你」） 本網站由 DiscordHubs
                團隊運營和維護。
              </p>
              <p className="mb-4">
                使用本服務，即表示您同意遵守這些使用條款。如果您不同意這些條款的任何部分，請勿使用我們的服務。
              </p>
              <p>
                我們保留隨時修改這些條款的權利。修改後的條款將在本頁面上發布。您繼續使用本服務將被視為接受修改後的條款。
              </p>
            </section>

            <section id="use-of-service">
              <h2 className="text-2xl font-bold text-white mb-4">
                2. 服務使用
              </h2>
              <p className="mb-4">
                DiscordHubs 提供一個平台，讓用戶可以發現、分享和推廣 Discord
                伺服器和機器人。我們的服務包括但不限於：伺服器和機器人列表、搜尋功能、投票系統和用戶資料管理。
              </p>
              <p className="mb-4">
                您同意僅將本服務用於合法目的，並遵守所有適用的法律和法規。您不得以任何可能損害、禁用、過度負載或損害我們服務器的方式使用本服務。
              </p>
              <p>
                我們保留拒絕向任何用戶提供服務的權利，並可以隨時因任何原因終止您的帳號或訪問權限，包括但不限於違反這些條款。
              </p>
            </section>

            <section id="account">
              <h2 className="text-2xl font-bold text-white mb-4">3. 帳號</h2>
              <p className="mb-4">
                使用我們的某些功能可能需要創建帳號。您負責維護您帳號的機密性，並對您帳號下發生的所有活動負全部責任。
              </p>
              <p className="mb-4">
                您同意立即通知我們任何未經授權使用您帳號的情況。我們不對因您未能保護帳號安全而導致的任何損失或損害負責。
              </p>
              <p>
                您必須提供準確、完整和最新的資訊。如果您提供的任何資訊不準確、不完整或過時，我們可能會暫停或終止您的帳號。
              </p>
            </section>

            <section id="content">
              <h2 className="text-2xl font-bold text-white mb-4">
                4. 用戶內容
              </h2>
              <p className="mb-4">
                您可以在我們的平台上發布、上傳或提交內容，包括但不限於伺服器和機器人資訊、描述、圖片和評論（統稱「用戶內容」）。
              </p>
              <p className="mb-4">
                您保留您對用戶內容的所有權利，但您授予我們非獨家、免版稅、可轉讓、可再授權、全球性的許可，允許我們使用、複製、修改、創建衍生作品、分發和公開展示您的用戶內容，以便我們提供和改進我們的服務。
              </p>
              <p>
                您聲明並保證您擁有或已獲得必要的許可，有權發布您提交的任何用戶內容，且該內容不侵犯任何第三方的權利。我們保留刪除任何違反這些條款或被認為有害或不適當的用戶內容的權利。
              </p>
            </section>

            <section id="prohibited">
              <h2 className="text-2xl font-bold text-white mb-4">
                5. 禁止行為
              </h2>
              <p className="mb-4">使用我們的服務時，您同意不會：</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>違反任何適用的法律或法規</li>
                <li>侵犯他人的知識產權或其他權利</li>
                <li>
                  發布、上傳或分享任何非法、有害、威脅、辱罵、騷擾、誹謗、淫穢或其他不適當的內容
                </li>
                <li>冒充任何人或實體，或虛假陳述您與任何人或實體的關係</li>
                <li>
                  使用自動化程序（如機器人、爬蟲、腳本、自動點擊器、外掛等第三方程式等）未經我們明確許可訪問我們的服務
                </li>
                <li>干擾或破壞我們服務的安全功能</li>
                <li>收集或存儲其他用戶的個人資料，未經其明確許可</li>
                <li>使用我們的服務進行任何商業招攬，除非得到我們的明確許可</li>
              </ul>
              <p>
                違反這些禁止行為可能導致您的帳號被暫停或終止，並可能被報告給相關執法機構，我們將保留追溯您的行為的權力
              </p>
            </section>

            <section id="termination">
              <h2 className="text-2xl font-bold text-white mb-4">6. 終止</h2>
              <p className="mb-4">
                我們保留在任何時候因任何原因終止或暫停您使用我們服務的權利，包括但不限於違反這些使用條款。
              </p>
              <p>
                終止後，您使用本服務的權利將立即停止。如果您希望終止您的帳號，您可以停止使用本服務並聯繫我們刪除您的帳號。
              </p>
            </section>

            <section id="disclaimer">
              <h2 className="text-2xl font-bold text-white mb-4">
                7. 免責聲明
              </h2>
              <p className="mb-4">
                本服務按「現狀」和「可用性」提供，不提供任何明示或暗示的保證。我們不保證服務將不間斷、及時、安全或無錯誤，也不保證結果將準確或可靠。
              </p>
              <p>
                您理解並同意，您使用本服務的風險完全由您自己承擔。我們不對任何用戶發布的內容負責，也不對用戶之間的互動負責。
              </p>
            </section>

            <section id="limitation">
              <h2 className="text-2xl font-bold text-white mb-4">
                8. 責任限制
              </h2>
              <p className="mb-4">
                在任何情況下，我們、我們的員工、合作夥伴或代理人均不對任何間接、偶然、特殊、後果性或懲罰性損害負責，包括但不限於利潤損失、數據損失、替代成本或任何類似損害。
              </p>
              <p>我們將服務授權予您使用，其相關責任將由您承擔</p>
              <p>在允許排除或限制責任的國家，在適用法律准許的最大範圍內</p>
              <p>
                對於這些條款、使用服務、未能使用服務導致的任何損失，而無論是基於保證、合約、法規、侵權（包括疏忽）、產品責任或任何其他法律理論
              </p>
              <p>
                我們與相關人員概不負責，且不論我們是否獲得告知此等損害的可能性，即使本服務條款提供的有限救濟被裁定未能達到其基本目的亦為如此。
              </p>
            </section>

            <section id="changes">
              <h2 className="text-2xl font-bold text-white mb-4">
                9. 條款變更
              </h2>
              <p className="mb-4">
                我們保留隨時修改這些使用條款的權利。修改後的條款將在本頁面上發布，並在發布時立即生效。
              </p>
              <p>
                您有責任定期查看這些條款。您在條款修改後繼續使用本服務，即表示您接受並同意修改後的條款。
              </p>
            </section>

            <section id="link">
              <h2 className="text-2xl font-bold text-white mb-4">
                11. 鏈結其他網站
              </h2>
              <p className="mb-4">我們的網頁可能包含其他網站的連結或資訊</p>
              <p>這些網站的隱私權政策、服務條款等與我們無關。</p>
            </section>

            <section id="privacy">
              <h2 className="text-2xl font-bold text-white mb-4">
                11. 隱私權條款
              </h2>
              <p className="mb-4">使用我們的本服務即表示同意隱私權條款。</p>
            </section>

            <section id="contact">
              <h2 className="text-2xl font-bold text-white mb-4">
                12. 聯絡我們
              </h2>
              <p className="mb-4">
                如果您對這些使用條款有任何問題或意見，請通過以下方式聯繫我們：
              </p>
              <div className="bg-[#36393f] p-4 rounded-lg border border-[#1e1f22]">
                <p className="mb-2">
                  <a
                    href="https://discord.gg/puQ9DPdG3M"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Discord群組：https://discord.gg/puQ9DPdG3M
                  </a>
                </p>
                <a href="mailto:support@DiscordHubs.org">
                  <p className="mb-2">電子郵件：support@DiscordHubs.org</p>
                </a>
              </div>
            </section>
          </div>

          {/* 最後更新 */}
          <div className="mt-12 pt-6 border-t border-[#1e1f22] text-center">
            <p className="text-gray-400 text-sm">
              這些使用條款最後更新於 2025 年 4 月 16 日
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
