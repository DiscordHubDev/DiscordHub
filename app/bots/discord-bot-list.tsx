'use client';

import type React from 'react';

import {
  useState,
  useEffect,
  useMemo,
  Suspense,
  useCallback,
  useTransition,
} from 'react';
import BotList from '@/components/bot-list';
import { botCategories as initialCategories } from '@/lib/bot-categories';
import type { CategoryType } from '@/lib/types';
import { PublicBot } from '@/lib/prisma_type';
import { BotListSkeleton } from '@/components/bot-skeleton';
import { getBotsByCategoryAction } from '@/lib/actions/bots';
import { usePathname, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategorySearch from '@/components/category-search';
import MobileCategoryFilter from '@/components/mobile-category-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Pagination from '@/components/pagination';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

const LazyBotList = ({ bots }: { bots: PublicBot[] }) => (
  <Suspense fallback={<BotListSkeleton />}>
    <BotList bots={bots} />
  </Suspense>
);

type DiscordBotListProps = {
  initialBots: PublicBot[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  allBotsForFiltering: PublicBot[];
};

const sortBotsByCategory = (
  bots: PublicBot[],
  category: string,
): PublicBot[] => {
  const botsCopy = [...bots];
  if (category === 'popular') {
    return botsCopy.sort((a, b) => b.servers - a.servers);
  }
  if (category === 'new') {
    return botsCopy.sort(
      (a, b) => +new Date(b.approvedAt!) - +new Date(a.approvedAt!),
    );
  }
  if (category === 'featured') {
    return botsCopy
      .filter(bot => bot.servers >= 1000)
      .sort((a, b) => b.upvotes - a.upvotes || b.servers - a.servers);
  }
  if (category === 'verified') {
    return botsCopy
      .filter(bot => bot.verified)
      .sort((a, b) => +new Date(b.approvedAt!) - +new Date(a.approvedAt!));
  }
  if (category === 'voted') {
    return botsCopy.sort((a, b) => b.upvotes - a.upvotes);
  }
  return botsCopy;
};

const filterBotsBySearch = (bots: PublicBot[], query: string): PublicBot[] => {
  if (!query.trim()) return bots;
  const q = query.toLowerCase();
  return bots.filter(
    bot =>
      bot.name.toLowerCase().includes(q) ||
      bot.description.toLowerCase().includes(q) ||
      (Array.isArray(bot.tags) &&
        bot.tags.some(tag => tag.toLowerCase().includes(q))),
  );
};

export default function DiscordBotListPageClient({
  initialBots,
  initialTotal,
  initialPage,
  initialTotalPages,
  allBotsForFiltering,
}: DiscordBotListProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // --- State ---
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );
  const [categories, setCategories] =
    useState<CategoryType[]>(initialCategories);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'popular',
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [bots, setBots] = useState<PublicBot[]>(initialBots);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const renderBotListWithFallback = (bots: PublicBot[]) => {
    // if (!isClient) {
    //   return (
    //     <div className="min-h-screen bg-[#1e1f22] text-white flex flex-col items-center justify-center space-y-4">
    //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5865f2]"></div>
    //       <p className="text-sm text-gray-400 animate-breath">加載中...</p>
    //     </div>
    //   );
    // }

    if (isLoading) {
      return <BotListSkeleton />;
    }

    if (!bots || bots.length === 0) {
      return (
        <div className="text-center text-gray-400 py-10">
          <p className="text-sm">找不到符合條件的機器人 🙁</p>
        </div>
      );
    }

    return (
      <>
        <LazyBotList bots={bots} />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </>
    );
  };

  // --- Filtering ---
  const useClientSideFiltering = Boolean(
    searchQuery.trim() || selectedCategoryIds.length,
  );

  // Memoized client-side filter and pagination
  const clientFilteredBots = useMemo(() => {
    if (!useClientSideFiltering) return [];
    let filtered = allBotsForFiltering;
    if (selectedCategoryIds.length) {
      const categoryNames = categories
        .filter(cat => selectedCategoryIds.includes(cat.id))
        .map(cat => cat.name.toLowerCase());
      filtered = filtered.filter(
        bot =>
          Array.isArray(bot.tags) &&
          bot.tags.some(tag =>
            categoryNames.some(catName => tag.toLowerCase().includes(catName)),
          ),
      );
    }
    return filterBotsBySearch(
      sortBotsByCategory(filtered, activeTab),
      searchQuery,
    );
  }, [
    allBotsForFiltering,
    selectedCategoryIds,
    categories,
    activeTab,
    searchQuery,
    useClientSideFiltering,
  ]);

  const clientPaginationData = useMemo(() => {
    if (!useClientSideFiltering) return null;
    const totalFiltered = clientFilteredBots.length;
    const totalPagesFiltered = Math.ceil(totalFiltered / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      bots: clientFilteredBots.slice(startIndex, startIndex + ITEMS_PER_PAGE),
      total: totalFiltered,
      totalPages: totalPagesFiltered,
    };
  }, [clientFilteredBots, currentPage, useClientSideFiltering]);

  const displayData =
    useClientSideFiltering && clientPaginationData
      ? clientPaginationData
      : { bots, total, totalPages };

  // --- Handlers ---
  const updateURL = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([key, value]) =>
        value == null || value === ''
          ? params.delete(key)
          : params.set(key, value),
      );
      window.history.replaceState({}, '', `${pathname}?${params.toString()}`);
    },
    [pathname, searchParams],
  );

  const fetchBotPage = useCallback(
    async (page: number, tab: string) => {
      if (useClientSideFiltering) return;
      setIsLoading(true);
      try {
        const result = await getBotsByCategoryAction(tab, page, ITEMS_PER_PAGE);
        setBots(sortBotsByCategory(result.bots, tab));
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setCurrentPage(page);
      } catch (error) {
        console.error('獲取機器人數據失敗:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [useClientSideFiltering],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      startTransition(() => {
        setCurrentPage(page);
        if (!useClientSideFiltering) fetchBotPage(page, activeTab);
        updateURL({ page: page.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },
    [useClientSideFiltering, activeTab, fetchBotPage, updateURL],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      startTransition(() => {
        setActiveTab(value);
        setCurrentPage(1);
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 200);
        if (!useClientSideFiltering) fetchBotPage(1, value);
        updateURL({ tab: value, page: '1' });
      });
    },
    [useClientSideFiltering, fetchBotPage, updateURL],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      setCurrentPage(1);
      value.trim() ? setIsSearching(true) : setIsSearching(false);
      if (value.trim()) setTimeout(() => setIsSearching(false), 300);
      updateURL({ search: value.trim() || null, page: '1' });
    },
    [updateURL],
  );

  const handleCategoryChange = useCallback(
    (newSelectedCategoryIds: string[]) => {
      setSelectedCategoryIds(newSelectedCategoryIds);
      setCurrentPage(1);
      updateURL({ page: '1' });
    },
    [updateURL],
  );

  const handleAddCustomCategory = useCallback(
    (categoryName: string) => {
      if (
        categories.some(
          cat => cat.name.toLowerCase() === categoryName.toLowerCase(),
        )
      )
        return;
      const newCategory: CategoryType = {
        id: `custom-${Date.now()}`,
        name: categoryName,
        color: `bg-[#${Math.floor(Math.random() * 16777215).toString(16)}]`,
        selected: true,
      };
      setCategories([...categories, newCategory]);
      setSelectedCategoryIds([...selectedCategoryIds, newCategory.id]);
      setCurrentPage(1);
      updateURL({ page: '1' });
    },
    [categories, selectedCategoryIds, updateURL],
  );

  const stats = useMemo(
    () => ({
      totalBots: allBotsForFiltering.length,
      verifiedBots: allBotsForFiltering.filter(bot => bot.verified).length,
      totalTags: allBotsForFiltering.reduce(
        (total, bot) => total + (Array.isArray(bot.tags) ? bot.tags.length : 0),
        0,
      ),
    }),
    [allBotsForFiltering],
  );

  // --- Effects ---
  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    const tab = searchParams.get('tab');
    const search = searchParams.get('search');
    const page = searchParams.get('page');
    if (tab && tab !== activeTab) setActiveTab(tab);
    if (search !== searchQuery) setSearchQuery(search || '');
    if (page && parseInt(page) !== currentPage) setCurrentPage(parseInt(page));
  }, [searchParams, activeTab, searchQuery, currentPage]);

  // if (!isClient) {
  //   return (
  //     <div className="min-h-screen bg-[#1e1f22] text-white flex flex-col items-center justify-center space-y-4">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5865f2]"></div>
  //       <p className="text-sm text-gray-400 animate-breath">加載中...</p>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#5865f2] to-[#8c54ff] py-16 overflow-hidden">
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            發現最棒的 Discord 機器人
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            探索數百個功能豐富的機器人，為您的伺服器增添更多功能和樂趣
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Input
              placeholder="搜尋機器人名稱、標籤或描述..."
              className="pl-10 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
              size={20}
            />
            <Button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white text-[#5865f2] hover:bg-white/90 sm:hidden"
              size="icon"
            >
              <Search size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 移動設備上的分類過濾器 */}
        <div className="lg:hidden mb-6">
          <MobileCategoryFilter
            categories={categories}
            onCategoryChange={handleCategoryChange}
            onCustomCategoryAdd={handleAddCustomCategory}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主要內容 */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <Tabs
              defaultValue="featured"
              className="mb-8"
              onValueChange={handleTabChange}
              value={activeTab}
            >
              <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full h-full overflow-x-auto overflow-y-auto">
                <TabsTrigger
                  value="popular"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  熱門機器人
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  精選機器人
                </TabsTrigger>
                <TabsTrigger
                  value="new"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  最新機器人
                </TabsTrigger>
                <TabsTrigger
                  value="verified"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  已驗證機器人
                </TabsTrigger>
                <TabsTrigger
                  value="voted"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  票選機器人
                </TabsTrigger>
              </TabsList>

              <TabsContent value="featured" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">精選機器人</h2>
                </div>
                {renderBotListWithFallback(displayData.bots)}
              </TabsContent>

              <TabsContent value="popular" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">熱門機器人</h2>
                </div>
                {renderBotListWithFallback(displayData.bots)}
              </TabsContent>

              <TabsContent value="new" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">最新機器人</h2>
                </div>
                {renderBotListWithFallback(displayData.bots)}
              </TabsContent>

              <TabsContent value="verified" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">驗證機器人</h2>
                </div>
                {renderBotListWithFallback(displayData.bots)}
              </TabsContent>

              <TabsContent value="voted" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">票選機器人</h2>
                </div>
                {renderBotListWithFallback(displayData.bots)}
              </TabsContent>
            </Tabs>
          </div>

          {/* 側邊欄 */}
          <div className="lg:col-span-1 order-1 lg:order-2 hidden lg:block">
            <div className="bg-[#2b2d31] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold mb-4">分類</h3>
              <div className="mb-4">
                <CategorySearch
                  categories={categories}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
            </div>

            <div className="bg-[#2b2d31] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold mb-4">機器人統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">總機器人數</span>
                  <span className="font-medium">{stats.totalBots}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">已驗證機器人</span>
                  <span className="font-medium">{stats.verifiedBots}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">目前已被使用的分類總數</span>
                  <span className="font-medium">{stats.totalTags}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#2b2d31] rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4">新增您的機器人</h3>
              <p className="text-gray-300 text-sm mb-4">
                想要推廣您的 Discord
                機器人嗎？立即加入我們的平台，讓更多人發現您的創作！
              </p>
              <Link href="/add-bot">
                <Button className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white">
                  新增機器人
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 移動設備上的新增機器人按鈕 */}
        <div className="lg:hidden mt-8">
          <div className="bg-[#2b2d31] rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">新增您的機器人</h3>
            <p className="text-gray-300 text-sm mb-4">
              想要推廣您的 Discord
              機器人嗎？立即加入我們的平台，讓更多人發現您的創作！
            </p>
            <Link href="/add-bot">
              <Button className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white">
                新增機器人
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
