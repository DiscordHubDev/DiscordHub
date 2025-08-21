// app/servers/page.tsx
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getAllServersAction,
  getServersByCategoryAction,
} from '@/lib/actions/servers';
import DiscordServerListPageClient from './client';
interface ServersPageProps {
  searchParams: {
    page?: string;
    tab?: string;
    search?: string;
  };
}

// 載入骨架屏組件
function ServerPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* Hero Banner Skeleton */}
      <div className="bg-[#5865f2] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="h-12 bg-white/10 rounded mx-auto mb-4 max-w-2xl"></div>
          <div className="h-6 bg-white/10 rounded mx-auto mb-8 max-w-3xl"></div>
          <div className="h-14 bg-white/10 rounded mx-auto max-w-2xl"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主要內容骨架 */}
          <div className="lg:col-span-3">
            {/* 標籤骨架 */}
            <div className="flex space-x-2 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 bg-[#36393f]" />
              ))}
            </div>

            {/* 伺服器列表骨架 */}
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-32 bg-[#2b2d31]" />
              ))}
            </div>

            {/* 分頁骨架 */}
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 bg-[#36393f]" />
              ))}
            </div>
          </div>

          {/* 側邊欄骨架 */}
          <div className="lg:col-span-1 hidden lg:block space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#2b2d31] rounded-lg p-5">
                <Skeleton className="h-6 w-20 mb-4 bg-[#36393f]" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 bg-[#36393f]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 主要數據載入組件
async function ServerDataContainer({ searchParams }: ServersPageProps) {
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const tab = searchParams.tab || 'popular';

  const { servers, total, currentPage, totalPages } =
    await getServersByCategoryAction(tab, page, 10);

  try {
    console.time('SSR-data-fetch');

    // 只需要獲取所有伺服器數據，在客戶端處理排序和分頁
    const allServers = await getAllServersAction();

    console.timeEnd('SSR-data-fetch');

    return (
      <DiscordServerListPageClient
        initialServers={servers}
        initialTotal={total}
        initialPage={currentPage}
        initialTotalPages={totalPages}
        allServersForFiltering={allServers}
      />
    );
  } catch (error) {
    console.error('SSR 數據獲取錯誤:', error);

    // 錯誤回退 - 顯示基本的錯誤頁面
    return (
      <div className="min-h-screen bg-[#1e1f22] text-white flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-red-400 mb-4">載入失敗</h1>
          <p className="text-gray-400 mb-6">無法載入伺服器列表，請稍後再試。</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#5865f2] hover:bg-[#4752c4] rounded-lg text-white font-medium transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }
}

export default function ServersPage({ searchParams }: ServersPageProps) {
  return (
    <Suspense fallback={<ServerPageSkeleton />}>
      <ServerDataContainer searchParams={searchParams} />
    </Suspense>
  );
}
// 頁面配置
export const dynamic = 'force-dynamic'; // 確保每次都是最新數據
export const revalidate = 30; // 30秒重新驗證
