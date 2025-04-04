"use client";

import type React from "react";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServerList from "@/components/server-list";
import FeaturedServers from "@/components/featured-servers";
import CategoryFilter from "@/components/category-filter";
import CategorySearch from "@/components/category-search";
import MobileCategoryFilter from "@/components/mobile-category-filter";
import {
  servers as allServers,
  Servercategories as initialCategories,
} from "@/lib/mock-data";
import type { ServerType, CategoryType } from "@/lib/types";

export default function DiscordServerListPage() {
  const [servers, setServers] = useState<ServerType[]>(allServers);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] =
    useState<CategoryType[]>(initialCategories);

  // 處理分類過濾
  const handleCategoryChange = (selectedCategoryIds: string[]) => {
    if (selectedCategoryIds.length === 0) {
      // 如果沒有選擇任何分類，顯示所有伺服器
      setServers(allServers);
    } else {
      // 根據選擇的分類過濾伺服器
      const filteredServers = allServers.filter((server) => {
        // 這裡假設伺服器的標籤與分類名稱相關
        // 實際應用中可能需要更複雜的邏輯
        const categoryNames = categories
          .filter((cat) => selectedCategoryIds.includes(cat.id))
          .map((cat) => cat.name.toLowerCase());

        return server.tags.some((tag) =>
          categoryNames.some((catName) => tag.toLowerCase().includes(catName))
        );
      });

      setServers(filteredServers);
    }
  };

  // 添加自定義分類
  const handleAddCustomCategory = (categoryName: string) => {
    // 檢查是否已存在相同名稱的分類
    const exists = categories.some(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
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
      ...categories.filter((c) => c.selected).map((c) => c.id),
      newCategory.id,
    ]);
  };

  // 處理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setServers(allServers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchResults = allServers.filter(
      (server) =>
        server.name.toLowerCase().includes(query) ||
        server.description.toLowerCase().includes(query) ||
        server.tags.some((tag) => tag.toLowerCase().includes(query))
    );

    setServers(searchResults);
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
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Input
              placeholder="搜尋伺服器名稱、標籤或描述..."
              className="pl-10 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <Tabs defaultValue="featured" className="mb-8">
              <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full overflow-x-auto">
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
              </TabsList>

              <TabsContent value="featured" className="mt-6">
                <FeaturedServers servers={servers.filter((s) => s.featured)} />
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">所有伺服器</h2>
                  <ServerList servers={servers} />
                </div>
              </TabsContent>

              <TabsContent value="popular" className="mt-6">
                <ServerList
                  servers={[...servers].sort((a, b) => b.members - a.members)}
                />
              </TabsContent>

              <TabsContent value="new" className="mt-6">
                <ServerList
                  servers={[...servers].sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )}
                />
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
              <h3 className="text-lg font-semibold mb-4">伺服器統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">總伺服器數</span>
                  <span className="font-medium">{allServers.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">本週新增</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">在線用戶</span>
                  <span className="font-medium">1,245</span>
                </div>
              </div>
            </div>

            <div className="bg-[#2b2d31] rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4">新增您的伺服器</h3>
              <p className="text-gray-300 text-sm mb-4">
                想要推廣您的 Discord
                伺服器嗎？立即加入我們的平台，讓更多人發現您的社群！
              </p>
              <Button className="w-full bg-[#5865f2] hover:bg-[#4752c4]">
                新增伺服器
              </Button>
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
            <Button className="w-full bg-[#5865f2] hover:bg-[#4752c4]">
              新增伺服器
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
