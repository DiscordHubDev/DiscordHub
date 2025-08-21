import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllBotsAction, getBotsByCategoryAction } from '@/lib/actions/bots';
import DiscordBotListPageClient from './discord-bot-list';

interface BotsPageSearchParams {
  page?: string;
  tab?: string;
  search?: string;
}

interface BotsPageProps {
  searchParams?: Promise<BotsPageSearchParams>;
}

function BotPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {' '}
      {/* Hero Banner Skeleton */}{' '}
      <div className="bg-gradient-to-br from-[#5865f2] to-[#8c54ff] py-16">
        {' '}
        <div className="max-w-7xl mx-auto px-4 text-center">
          {' '}
          <div className="h-12 bg-white/10 rounded mx-auto mb-4 max-w-2xl"></div>{' '}
          <div className="h-6 bg-white/10 rounded mx-auto mb-8 max-w-3xl"></div>{' '}
          <div className="h-14 bg-white/10 rounded mx-auto max-w-2xl"></div>{' '}
        </div>{' '}
      </div>{' '}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {' '}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {' '}
          {/* 主要內容骨架 */}{' '}
          <div className="lg:col-span-3">
            {' '}
            {/* 標籤骨架 */}{' '}
            <div className="flex space-x-2 mb-8">
              {' '}
              <Skeleton className="h-10 w-full bg-[#36393f]" />{' '}
            </div>{' '}
            {/* Bot 列表骨架 */}{' '}
            <div className="space-y-4">
              {' '}
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-32 bg-[#2b2d31]" />
              ))}{' '}
            </div>{' '}
            {/* 分頁骨架 */}{' '}
            <div className="flex justify-center space-x-2 mt-8">
              {' '}
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 bg-[#36393f]" />
              ))}{' '}
            </div>{' '}
          </div>{' '}
          {/* 側邊欄骨架 */}{' '}
          <div className="lg:col-span-1 hidden lg:block space-y-6">
            {' '}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#2b2d31] rounded-lg p-5">
                {' '}
                <Skeleton className="h-6 w-20 mb-4 bg-[#36393f]" />{' '}
                <div className="space-y-2">
                  {' '}
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 bg-[#36393f]" />
                  ))}{' '}
                </div>{' '}
              </div>
            ))}{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
}

// 主要數據載入組件
async function BotDataContainer({ searchParams }: BotsPageProps) {
  const sp = (searchParams ? await searchParams : {}) as BotsPageSearchParams;

  const page = Math.max(1, parseInt(sp.page ?? '1'));
  const tab = sp.tab ?? 'popular';

  try {
    console.time('SSR-bot-fetch');

    const { bots, total, currentPage, totalPages } =
      await getBotsByCategoryAction(tab, page, 10);

    // 只需要獲取所有 bots 數據，在客戶端處理排序和分頁
    const allBots = await getAllBotsAction();

    console.timeEnd('SSR-bot-fetch');

    return (
      <DiscordBotListPageClient
        initialBots={bots}
        initialTotal={total}
        initialPage={currentPage}
        initialTotalPages={totalPages}
        allBotsForFiltering={allBots}
      />
    );
  } catch (error) {
    console.error('SSR Bot 數據獲取錯誤:', error);
    return (
      <div className="min-h-screen bg-[#1e1f22] text-white flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-red-400 mb-4">載入失敗</h1>
          <p className="text-gray-400 mb-6">無法載入機器人列表，請稍後再試。</p>
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

export default function BotsPage(props: BotsPageProps) {
  return (
    <Suspense fallback={<BotPageSkeleton />}>
      <BotDataContainer {...props} />
    </Suspense>
  );
}

// 頁面配置
export const dynamic = 'force-dynamic';
export const revalidate = 30;
