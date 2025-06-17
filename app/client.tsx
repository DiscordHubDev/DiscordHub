'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServerList from '@/components/server-list';
import CategoryFilter from '@/components/category-filter';
import CategorySearch from '@/components/category-search';
import MobileCategoryFilter from '@/components/mobile-category-filter';
import { Servercategories as initialCategories } from '@/lib/categories';
import type { CategoryType } from '@/lib/types';
import { ServerType } from '@/lib/prisma_type';
import Link from 'next/link';
import Pagination from '@/components/pagination';

const ITEMS_PER_PAGE = 10;

type DiscordServerListProps = {
  servers: ServerType[];
};

export default function DiscordServerListPageClient({
  servers: allServers,
}: DiscordServerListProps) {
  const [servers, setServers] = useState<ServerType[]>(
    allServers
      .filter(server => server.members >= 1000)
      .sort((a, b) => b.upvotes - a.upvotes)
      .sort((a, b) => b.members - a.members),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] =
    useState<CategoryType[]>(initialCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('featured');
  const [showNoResultMessage, setShowNoResultMessage] = useState(false);

  // 渲染伺服器列表
  const renderServerListWithFallback = (servers: ServerType[]) => {
    if (!servers || servers.length === 0) {
      return (
        <div className="text-center text-gray-400 py-10">
          <p className="text-sm">找不到符合條件的伺服器 🙁</p>
        </div>
      );
    }

    return (
      <>
        <ServerList servers={servers} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </>
    );
  };

  // 計算總頁數
  const totalPages = Math.ceil(servers.length / ITEMS_PER_PAGE);

  // 獲取當前頁的伺服器
  const getCurrentPageServers = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return servers.slice(startIndex, endIndex);
  };

  const calculateTotalTags = () => {
    let totalTags = 0;
    allServers.forEach(server => {
      if (Array.isArray(server.tags)) {
        totalTags += server.tags.length;
      }
    });
    return totalTags;
  };

  // 當過濾條件改變時，重置頁碼
  useEffect(() => {
    setCurrentPage(1);
  }, [servers.length]);

  // 處理分類過濾
  const handleCategoryChange = (selectedCategoryIds: string[]) => {
    if (selectedCategoryIds.length === 0) {
      // 如果沒有選擇任何分類，顯示所有伺服器
      setServers(allServers);
    } else {
      // 根據選擇的分類過濾伺服器
      const filteredServers = allServers.filter(server => {
        // 這裡假設伺服器的標籤與分類名稱相關
        // 實際應用中可能需要更複雜的邏輯
        const categoryNames = categories
          .filter(cat => selectedCategoryIds.includes(cat.id))
          .map(cat => cat.name.toLowerCase());

        return (
          Array.isArray(server.tags) &&
          server.tags.some(tag =>
            categoryNames.some(catName => tag.toLowerCase().includes(catName)),
          )
        );
      });

      setServers(filteredServers);
    }
  };

  // 添加自定義分類
  const handleAddCustomCategory = (categoryName: string) => {
    // 檢查是否已存在相同名稱的分類
    const exists = categories.some(
      cat => cat.name.toLowerCase() === categoryName.toLowerCase(),
    );

    if (exists) return;

    // 創建新分類
    const newCategory: CategoryType = {
      id: `custom-${Date.now()}`,
      name: categoryName,
      color: `bg-[#${Math.floor(Math.random() * 16777215).toString(16)}]`, // 隨機顏色
      selected: true,
    };

    // 更新分類列表
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);

    // 自動選中新分類
    handleCategoryChange([
      ...categories.filter(c => c.selected).map(c => c.id),
      newCategory.id,
    ]);
  };

  const filterAndSearchServers = (category: string, query: string = '') => {
    let filtered = [...allServers];

    switch (category) {
      case 'popular':
        filtered.sort((a, b) => b.members - a.members);
        break;
      case 'new':
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
        );
        break;
      case 'featured':
        filtered = filtered
          .filter(server => server.members >= 1000)
          .sort((a, b) => b.upvotes - a.upvotes)
          .sort((a, b) => b.members - a.members);
        break;
      case 'voted':
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
    }

    // 套用搜尋關鍵字
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        server =>
          server.name.toLowerCase().includes(q) ||
          server.description.toLowerCase().includes(q) ||
          (Array.isArray(server.tags) &&
            server.tags.some(tag => tag.toLowerCase().includes(q))),
      );
    }

    setServers(filtered);

    // 處理特殊提示（例如 featured 無資料）
    if (filtered.length === 0) {
      setShowNoResultMessage(true);
    } else {
      setShowNoResultMessage(false);
    }
  };

  // 處理搜索
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    filterAndSearchServers(activeTab, value);
  };

  // 處理頁面變更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 滾動到頁面頂部
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const allfeatured = () => {
    let sortedServers = [...allServers];
    sortedServers.sort((a, b) => b.members - a.members);
    sortedServers = sortedServers.filter(server => server.members >= 1000);
    return sortedServers.length;
  };

  // 處理標籤切換
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    filterAndSearchServers(value, searchQuery); // 套用目前搜尋內容
  };

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
            >
              <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full h-full overflow-x-auto overflow-y-auto">
                <TabsTrigger
                  value="featured"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  精選伺服器
                </TabsTrigger>
                <TabsTrigger
                  value="popular"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  熱門伺服器
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
                {renderServerListWithFallback(getCurrentPageServers())}
              </TabsContent>

              <TabsContent value="popular" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">熱門伺服器</h2>
                {renderServerListWithFallback(getCurrentPageServers())}
              </TabsContent>

              <TabsContent value="new" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">最新伺服器</h2>
                {renderServerListWithFallback(getCurrentPageServers())}
              </TabsContent>

              <TabsContent value="voted" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">票選伺服器</h2>
                {renderServerListWithFallback(getCurrentPageServers())}
              </TabsContent>
            </Tabs>
          </div>

          {/* 側邊欄 */}
          <div className="lg:col-span-1 order-1 lg:order-2 hidden lg:block">
            <div className="bg-[#2b2d31] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold mb-4">分類</h3>

              {/* 分類搜尋和自定義分類 */}
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
                  <span className="font-medium">{allServers.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">總精選伺服器數量</span>
                  <span className="font-medium">{allfeatured()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">目前已被使用的分類總數</span>
                  <span className="font-medium">{calculateTotalTags()}</span>
                </div>
              </div>
            </div>

            <div className="mb-6 mt-4">
              <iframe
                src="https://discord.com/widget?id=1297055626014490695&theme=dark"
                width="290"
                height="500"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              ></iframe>
            </div>

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
