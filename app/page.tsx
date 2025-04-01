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
import MobileMenu from "@/components/mobile-menu";
import {
  servers as allServers,
  categories as initialCategories,
} from "@/lib/mock-data";
import type { ServerType, CategoryType } from "@/lib/types";
import Link from "next/link";

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
      {/* Navigation */}
      <nav className="bg-[#2b2d31] border-b border-[#1e1f22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="text-xl font-bold text-white flex items-center"
                >
                  <span className="text-[#5865f2] mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-message-square-more"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M8 10h.01" />
                      <path d="M12 10h.01" />
                      <path d="M16 10h.01" />
                    </svg>
                  </span>
                  DiscordHubs
                </Link>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-center space-x-4">
                  <Link href="/" passHref>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-[#36393f] bg-[#36393f]"
                    >
                      伺服器列表
                    </Button>
                  </Link>
                  <Link href="/bots" passHref>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-[#36393f]"
                    >
                      機器人列表
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-[#36393f]"
                  >
                    新增伺服器
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-[#36393f]"
                  >
                    關於我們
                  </Button>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                登入
              </Button>
            </div>
            <MobileMenu />
          </div>
        </div>
      </nav>

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

      {/* Footer */}
      <footer className="bg-[#2b2d31] mt-12 py-8 border-t border-[#1e1f22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">DiscordHubs</h3>
              <p className="text-gray-400 text-sm">
                最佳的 Discord 伺服器列表平台，幫助您發現和加入有趣的社群。
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">連結</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    首頁
                  </Link>
                </li>
                <li>
                  <Link href="/bots" className="hover:text-white">
                    機器人列表
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    新增伺服器
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">資源</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Discord 官方
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    開發者文檔
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    社群指南
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    常見問題
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">法律</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    服務條款
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    隱私政策
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cookie 政策
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    DMCA
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#1e1f22] flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 DiscordHubs. 保留所有權利。
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
