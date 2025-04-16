'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BotList from '@/components/bot-list';
import FeaturedBots from '@/components/featured-bots';
import CategoryFilter from '@/components/category-filter';
import CategorySearch from '@/components/category-search';
import MobileCategoryFilter from '@/components/mobile-category-filter';
import { botCategories as initialCategories } from '@/lib/bot-categories';
import type { BotType, CategoryType } from '@/lib/types';
import Link from 'next/link';
import { getAllBots } from '@/lib/actions/bots';
import { BotWithRelations } from '@/lib/prisma_type';
import Pagination from '@/components/pagination';

const ITEMS_PER_PAGE = 20;

export default function DiscordBotListPageClient({
  allBots,
}: {
  allBots: BotWithRelations[];
}) {
  const [bots, setBots] = useState<BotWithRelations[]>(allBots);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] =
    useState<CategoryType[]>(initialCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('featured');
  // 計算總頁數
  const totalPages = Math.ceil(bots.length / ITEMS_PER_PAGE);

  // 獲取當前頁的機器人
  const getCurrentPageBots = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return bots.slice(startIndex, endIndex);
  };

  const calculateTotalTags = () => {
    let totalTags = 0;
    allBots.forEach(bot => {
      if (Array.isArray(bot.tags)) {
        totalTags += bot.tags.length;
      }
    });
    return totalTags;
  };

  // 當過濾條件改變時，重置頁碼
  useEffect(() => {
    setCurrentPage(1);
  }, [bots.length]);

  // 處理分類過濾
  const handleCategoryChange = (selectedCategoryIds: string[]) => {
    if (selectedCategoryIds.length === 0) {
      // 如果沒有選擇任何分類，顯示所有機器人
      setBots(allBots);
    } else {
      // 根據選擇的分類過濾機器人
      const filteredBots = allBots.filter(bot => {
        // 這裡假設機器人的標籤與分類名稱相關
        // 實際應用中可能需要更複雜的邏輯
        const categoryNames = categories
          .filter(cat => selectedCategoryIds.includes(cat.id))
          .map(cat => cat.name.toLowerCase());

        return bot.tags.some(tag =>
          categoryNames.some(catName => tag.toLowerCase().includes(catName)),
        );
      });

      setBots(filteredBots);
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

  // 處理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setBots(allBots);
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchResults = allBots.filter(
      bot =>
        bot.name.toLowerCase().includes(query) ||
        bot.description.toLowerCase().includes(query) ||
        bot.tags.some(tag => tag.toLowerCase().includes(query)),
    );

    setBots(searchResults);
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

  // 處理標籤切換
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // 重置頁碼

    // 根據標籤排序機器人
    let sortedBots = [...allBots];
    if (value === 'popular') {
      sortedBots.sort((a, b) => b.servers - a.servers);
    } else if (value === 'new') {
      sortedBots.sort((a, b) => {
        return (
          new Date(b.approvedAt!).getTime() - new Date(a.approvedAt!).getTime()
        );
      });
    } else if (value === 'featured') {
      sortedBots = allBots
        .filter(b => b.servers >= 1000)
        .sort((a, b) => b.servers - a.servers);
    } else if (value === 'verified') {
      sortedBots = allBots.filter(b => b.verified);
      sortedBots.sort(
        (a, b) =>
          new Date(b.approvedAt!).getTime() - new Date(a.approvedAt!).getTime(),
      );
    } else if (value === 'voted') {
      sortedBots.sort((a, b) => b.upvotes - a.upvotes);
    }
    setBots(sortedBots);
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
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Input
              placeholder="搜尋機器人名稱、標籤或描述..."
              className="pl-10 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
              size={20}
            />
            <Button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white text-[#5865f2] hover:bg-white/90 hidden sm:flex"
            >
              搜尋
            </Button>
            <Button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white text-[#5865f2] hover:bg-white/90 sm:hidden"
              size="icon"
            >
              <Search size={18} />
            </Button>
          </form>
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
              <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full overflow-x-auto">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  所有機器人
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  精選機器人
                </TabsTrigger>
                <TabsTrigger
                  value="popular"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  熱門機器人
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

              <TabsContent value="all" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">所有機器人</h2>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
                <BotList bots={getCurrentPageBots()} />
              </TabsContent>

              <TabsContent value="featured" className="mt-6">
                <FeaturedBots bots={getCurrentPageBots()} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </TabsContent>

              <TabsContent value="popular" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">熱門機器人</h2>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
                <BotList bots={getCurrentPageBots()} />
              </TabsContent>

              <TabsContent value="new" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">最新機器人</h2>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
                <BotList bots={getCurrentPageBots()} />
              </TabsContent>

              <TabsContent value="verified" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">驗證機器人</h2>
                <BotList bots={getCurrentPageBots()} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </TabsContent>

              <TabsContent value="voted" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">票選機器人</h2>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
                <BotList bots={getCurrentPageBots()} />
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
                  onCustomCategoryAdd={handleAddCustomCategory}
                />
              </div>

              <div className="mt-4">
                <CategoryFilter
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
                  <span className="font-medium">{allBots.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">已驗證機器人</span>
                  <span className="font-medium">
                    {allBots.filter(b => b.verified).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">目前已被使用的分類總數</span>
                  <span className="font-medium">{calculateTotalTags()}</span>
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
                <Button className="w-full bg-[#5865f2] hover:bg-[#4752c4]">
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
              <Button className="w-full bg-[#5865f2] hover:bg-[#4752c4]">
                新增機器人
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
