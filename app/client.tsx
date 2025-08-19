'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServerList from '@/components/server-list';
import CategorySearch from '@/components/category-search';
import MobileCategoryFilter from '@/components/mobile-category-filter';
import { Servercategories as initialCategories } from '@/lib/categories';
import type { CategoryType } from '@/lib/types';
import { PublicServer, ServerType } from '@/lib/prisma_type';
import Link from 'next/link';
import Pagination from '@/components/pagination';
import DiscordWidget from '@/components/DiscordWidget';

const ITEMS_PER_PAGE = 10;

type DiscordServerListProps = {
  servers: PublicServer[];
  initialLoading?: boolean;
};

// 數據處理函數
const sortServersByCategory = (
  servers: PublicServer[],
  category: string,
): PublicServer[] => {
  const serversCopy = [...servers];

  switch (category) {
    case 'popular':
      return serversCopy.sort((a, b) => {
        if (a.pin !== b.pin) return a.pin ? -1 : 1;
        return b.members - a.members;
      });
    case 'new':
      return serversCopy.sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      );
    case 'featured':
      return serversCopy
        .filter(server => server.members >= 1000)
        .sort((a, b) => b.upvotes - a.upvotes)
        .sort((a, b) => b.members - a.members);
    case 'voted':
      return serversCopy.sort((a, b) => b.upvotes - a.upvotes);
    default:
      return serversCopy;
  }
};

const filterServersBySearch = (
  servers: PublicServer[],
  query: string,
): PublicServer[] => {
  if (!query.trim()) return servers;

  const q = query.toLowerCase();
  return servers.filter(
    server =>
      server.name.toLowerCase().includes(q) ||
      server.description.toLowerCase().includes(q) ||
      (Array.isArray(server.tags) &&
        server.tags.some(tag => tag.toLowerCase().includes(q))),
  );
};

export default function DiscordServerListPageClient({
  servers: allServers,
  initialLoading = false,
}: DiscordServerListProps) {
  const [isClient, setIsClient] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] =
    useState<CategoryType[]>(initialCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('popular');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // 新增：載入狀態管理
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [isSearching, setIsSearching] = useState(false);

  // 模擬初始載入完成（如果有初始載入狀態）
  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000); // 1秒後完成載入

      return () => clearTimeout(timer);
    }
  }, [initialLoading]);

  // 使用 useMemo 優化數據處理
  const processedServers = useMemo(() => {
    if (isLoading) return [];

    // 1. 首先根據分類過濾
    let filteredByCategory = allServers;

    if (selectedCategoryIds.length > 0) {
      const categoryNames = categories
        .filter(cat => selectedCategoryIds.includes(cat.id))
        .map(cat => cat.name.toLowerCase());

      filteredByCategory = allServers.filter(server => {
        return (
          Array.isArray(server.tags) &&
          server.tags.some(tag =>
            categoryNames.some(catName => tag.toLowerCase().includes(catName)),
          )
        );
      });
    }

    // 2. 根據當前標籤排序
    const sortedServers = sortServersByCategory(filteredByCategory, activeTab);

    // 3. 根據搜索關鍵字過濾
    const searchFiltered = filterServersBySearch(sortedServers, searchQuery);

    return searchFiltered;
  }, [
    allServers,
    selectedCategoryIds,
    categories,
    activeTab,
    searchQuery,
    isLoading,
  ]);

  // 計算統計數據
  const stats = useMemo(() => {
    if (isLoading) {
      return {
        totalServers: 0,
        featuredServers: 0,
        totalTags: 0,
      };
    }

    const featuredCount = allServers.filter(
      server => server.members >= 1000,
    ).length;
    const totalTags = allServers.reduce((total, server) => {
      return total + (Array.isArray(server.tags) ? server.tags.length : 0);
    }, 0);

    return {
      totalServers: allServers.length,
      featuredServers: featuredCount,
      totalTags,
    };
  }, [allServers, isLoading]);

  // 計算分頁數據
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(processedServers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageServers = processedServers.slice(startIndex, endIndex);

    return {
      totalPages,
      currentPageServers,
    };
  }, [processedServers, currentPage]);

  // 當過濾條件改變時，重置頁碼
  useEffect(() => {
    setCurrentPage(1);
  }, [processedServers.length]);

  // 處理分類過濾
  const handleCategoryChange = (newSelectedCategoryIds: string[]) => {
    setSelectedCategoryIds(newSelectedCategoryIds);
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

    const updatedSelectedIds = [...selectedCategoryIds, newCategory.id];
    setSelectedCategoryIds(updatedSelectedIds);
  };

  // 處理搜索 - 添加搜索載入狀態
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // 如果有搜索內容，顯示搜索載入狀態
    if (value.trim()) {
      setIsSearching(true);
      // 模擬搜索延遲
      setTimeout(() => {
        setIsSearching(false);
      }, 300);
    } else {
      setIsSearching(false);
    }
  };

  // 處理頁面變更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // 處理標籤切換 - 添加切換載入狀態
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);

    // 模擬標籤切換載入
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 200);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#1e1f22] text-white flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5865f2]"></div>
        <p className="text-sm text-gray-400 animate-breath">加載中...</p>
      </div>
    );
  }

  // 統一的載入狀態判斷
  const shouldShowSkeleton = isLoading || isSearching;

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* Hero Banner */}
      <div className="relative bg-[#5865f2] py-16 overflow-hidden">
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
            發現最棒的 Discord 社群
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            加入數千個有趣的伺服器，找到您的興趣社群，與志同道合的朋友一起交流
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Input
              placeholder="搜尋伺服器名稱、標籤或描述..."
              className="pl-10 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 w-full"
              value={searchQuery}
              onChange={handleChange}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
              size={20}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            )}
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
              className="mb-8"
              value={activeTab}
              onValueChange={handleTabChange}
            >
              <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full h-full overflow-x-auto overflow-y-auto">
                <TabsTrigger
                  value="popular"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  熱門伺服器
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  精選伺服器
                </TabsTrigger>
                <TabsTrigger
                  value="new"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  最新伺服器
                </TabsTrigger>
                <TabsTrigger
                  value="voted"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  票選伺服器
                </TabsTrigger>
              </TabsList>

              <TabsContent value="featured" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">精選伺服器</h2>
                <ServerList
                  servers={paginationData.currentPageServers}
                  isLoading={shouldShowSkeleton}
                  skeletonCount={ITEMS_PER_PAGE}
                />
                {!shouldShowSkeleton && paginationData.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={paginationData.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="popular" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">熱門伺服器</h2>
                <ServerList
                  servers={paginationData.currentPageServers}
                  isLoading={shouldShowSkeleton}
                  skeletonCount={ITEMS_PER_PAGE}
                />
                {!shouldShowSkeleton && paginationData.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={paginationData.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="new" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">最新伺服器</h2>
                <ServerList
                  servers={paginationData.currentPageServers}
                  isLoading={shouldShowSkeleton}
                  skeletonCount={ITEMS_PER_PAGE}
                />
                {!shouldShowSkeleton && paginationData.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={paginationData.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="voted" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">票選伺服器</h2>
                <ServerList
                  servers={paginationData.currentPageServers}
                  isLoading={shouldShowSkeleton}
                  skeletonCount={ITEMS_PER_PAGE}
                />
                {!shouldShowSkeleton && paginationData.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={paginationData.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
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
              <h3 className="text-lg font-semibold mb-4">伺服器統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">總伺服器數</span>
                  {isLoading ? (
                    <div className="h-4 w-8 bg-[#36393f] rounded animate-pulse" />
                  ) : (
                    <span className="font-medium">{stats.totalServers}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">總精選伺服器數量</span>
                  {isLoading ? (
                    <div className="h-4 w-8 bg-[#36393f] rounded animate-pulse" />
                  ) : (
                    <span className="font-medium">{stats.featuredServers}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">目前已被使用的分類總數</span>
                  {isLoading ? (
                    <div className="h-4 w-8 bg-[#36393f] rounded animate-pulse" />
                  ) : (
                    <span className="font-medium">{stats.totalTags}</span>
                  )}
                </div>
              </div>
            </div>

            <DiscordWidget />

            <div className="bg-[#2b2d31] rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4">新增您的伺服器</h3>
              <p className="text-gray-300 text-sm mb-4">
                想要推廣您的 Discord
                伺服器嗎？立即加入我們的平台，讓更多人發現您的社群！
              </p>
              <Link
                href="https://discord.gg/puQ9DPdG3M"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white">
                  新增伺服器
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 移動設備上的新增伺服器按鈕 */}
        <div className="lg:hidden mt-8">
          <div className="bg-[#2b2d31] rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">新增您的伺服器</h3>
            <p className="text-gray-300 text-sm mb-4">
              想要推廣您的 Discord
              伺服器嗎？立即加入我們的平台，讓更多人發現您的社群！
            </p>
            <Link
              href="https://discord.gg/puQ9DPdG3M"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white">
                新增伺服器
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
