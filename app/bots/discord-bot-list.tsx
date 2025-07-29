'use client';

import type React from 'react';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BotList from '@/components/bot-list';
import CategorySearch from '@/components/category-search';
import MobileCategoryFilter from '@/components/mobile-category-filter';
import { botCategories as initialCategories } from '@/lib/bot-categories';
import type { CategoryType } from '@/lib/types';
import Link from 'next/link';
import { BotType } from '@/lib/prisma_type';
import Pagination from '@/components/pagination';
import { BotListSkeleton } from '@/components/bot-skeleton';

const ITEMS_PER_PAGE = 10;

// 延遲加載的 BotList 組件
const LazyBotList = ({ bots }: { bots: BotType[] }) => (
  <Suspense fallback={<BotListSkeleton />}>
    <BotList bots={bots} />
  </Suspense>
);

export default function DiscordBotListPageClient({
  allBots,
}: {
  allBots: BotType[];
}) {
  // 使用 useMemo 預處理排序後的數據
  const sortedBots = useMemo(
    () => ({
      popular: [...allBots].sort((a, b) => b.servers - a.servers),
      featured: allBots
        .filter(b => b.servers >= 1000)
        .sort((a, b) => b.upvotes - a.upvotes)
        .sort((a, b) => b.servers - a.servers),
      new: [...allBots].sort(
        (a, b) =>
          new Date(b.approvedAt!).getTime() - new Date(a.approvedAt!).getTime(),
      ),
      verified: allBots
        .filter(b => b.verified)
        .sort(
          (a, b) =>
            new Date(b.approvedAt!).getTime() -
            new Date(a.approvedAt!).getTime(),
        ),
      voted: [...allBots].sort((a, b) => b.upvotes - a.upvotes),
    }),
    [allBots],
  );

  const [activeTab, setActiveTab] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] =
    useState<CategoryType[]>(initialCategories);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 使用 useMemo 計算過濾後的機器人
  const filteredBots = useMemo(() => {
    let bots =
      sortedBots[activeTab as keyof typeof sortedBots] || sortedBots.featured;

    // 分類過濾
    if (selectedCategoryIds.length > 0) {
      const categoryNames = categories
        .filter(cat => selectedCategoryIds.includes(cat.id))
        .map(cat => cat.name.toLowerCase());

      bots = bots.filter(bot =>
        bot.tags.some(tag =>
          categoryNames.some(catName => tag.toLowerCase().includes(catName)),
        ),
      );
    }

    // 搜索過濾
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (trimmedQuery) {
      bots = bots.filter(
        bot =>
          bot.name.toLowerCase().includes(trimmedQuery) ||
          bot.description.toLowerCase().includes(trimmedQuery) ||
          (Array.isArray(bot.tags) &&
            bot.tags.some(tag => tag.toLowerCase().includes(trimmedQuery))),
      );
    }

    return bots;
  }, [sortedBots, activeTab, selectedCategoryIds, searchQuery, categories]);

  // 計算分頁
  const totalPages = Math.ceil(filteredBots.length / ITEMS_PER_PAGE);
  const currentPageBots = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBots.slice(startIndex, endIndex);
  }, [filteredBots, currentPage]);

  // 統計數據計算（使用 useMemo 緩存）
  const stats = useMemo(() => {
    const totalTags = allBots.reduce((sum, bot) => {
      return sum + (Array.isArray(bot.tags) ? bot.tags.length : 0);
    }, 0);

    return {
      totalBots: allBots.length,
      verifiedBots: allBots.filter(b => b.verified).length,
      totalTags,
    };
  }, [allBots]);

  // 重置頁碼的副作用
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedCategoryIds]);

  // 處理搜索 - 使用防抖
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // 搜索邏輯已在 useMemo 中處理
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // 處理分類變更
  const handleCategoryChange = (categoryIds: string[]) => {
    setSelectedCategoryIds(categoryIds);
  };

  // 添加自定義分類
  const handleAddCustomCategory = (categoryName: string) => {
    const exists = categories.some(
      cat => cat.name.toLowerCase() === categoryName.toLowerCase(),
    );

    if (exists) return;

    const newCategory: CategoryType = {
      id: `custom-${Date.now()}`,
      name: categoryName,
      color: `bg-[#${Math.floor(Math.random() * 16777215).toString(16)}]`,
      selected: true,
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    setSelectedCategoryIds(prev => [...prev, newCategory.id]);
  };

  // 處理搜索輸入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 處理頁面變更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // 處理標籤切換
  const handleTabChange = (value: string) => {
    setIsLoading(true);
    setActiveTab(value);

    // 模擬短暫的加載狀態以提供視覺反饋
    setTimeout(() => setIsLoading(false), 100);
  };

  // 渲染機器人列表
  const renderBotListWithFallback = (bots: BotType[]) => {
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
                {renderBotListWithFallback(currentPageBots)}
              </TabsContent>

              <TabsContent value="popular" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">熱門機器人</h2>
                </div>
                {renderBotListWithFallback(currentPageBots)}
              </TabsContent>

              <TabsContent value="new" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">最新機器人</h2>
                </div>
                {renderBotListWithFallback(currentPageBots)}
              </TabsContent>

              <TabsContent value="verified" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">驗證機器人</h2>
                </div>
                {renderBotListWithFallback(currentPageBots)}
              </TabsContent>

              <TabsContent value="voted" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">票選機器人</h2>
                </div>
                {renderBotListWithFallback(currentPageBots)}
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
