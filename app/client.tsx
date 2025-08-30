'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
} from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServerList from '@/components/server-list';
import CategorySearch from '@/components/category-search';
import MobileCategoryFilter from '@/components/mobile-category-filter';
import { Servercategories as initialCategories } from '@/lib/categories';
import type { CategoryType } from '@/lib/types';
import { PublicServer } from '@/lib/prisma_type';
import Link from 'next/link';
import Pagination from '@/components/pagination';
import DiscordWidget from '@/components/DiscordWidget';
import { getServersByCategoryAction } from '@/lib/actions/servers';

const ITEMS_PER_PAGE = 10;

type DiscordServerListProps = {
  initialServers: PublicServer[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  allServersForFiltering: PublicServer[];
};

const sortServersByCategory = (
  servers: PublicServer[],
  category: string,
): PublicServer[] => {
  const serversCopy = [...servers];
  if (category === 'popular') {
    return serversCopy.sort((a, b) =>
      a.pin !== b.pin
        ? a.pin
          ? -1
          : 1
        : (b.pinExpiry ? +new Date(b.pinExpiry) : 0) -
          (a.pinExpiry ? +new Date(a.pinExpiry) : 0),
    );
  }
  if (category === 'new') {
    return serversCopy.sort(
      (a, b) => +new Date(b.createdAt!) - +new Date(a.createdAt!),
    );
  }
  if (category === 'featured') {
    return serversCopy
      .filter(server => server.members >= 1000)
      .sort((a, b) => b.upvotes - a.upvotes || b.members - a.members);
  }
  if (category === 'voted') {
    return serversCopy.sort((a, b) => b.upvotes - a.upvotes);
  }
  return serversCopy;
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
  initialServers,
  initialTotal,
  initialPage,
  initialTotalPages,
  allServersForFiltering,
}: DiscordServerListProps) {
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
  const [servers, setServers] = useState<PublicServer[]>(initialServers);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // --- Filtering ---
  const useClientSideFiltering = Boolean(
    searchQuery.trim() || selectedCategoryIds.length,
  );

  // Memoized client-side filter and pagination
  const clientFilteredServers = useMemo(() => {
    if (!useClientSideFiltering) return [];
    let filtered = allServersForFiltering;
    if (selectedCategoryIds.length) {
      const categoryNames = categories
        .filter(cat => selectedCategoryIds.includes(cat.id))
        .map(cat => cat.name.toLowerCase());
      filtered = filtered.filter(
        server =>
          Array.isArray(server.tags) &&
          server.tags.some(tag =>
            categoryNames.some(catName => tag.toLowerCase().includes(catName)),
          ),
      );
    }
    return filterServersBySearch(
      sortServersByCategory(filtered, activeTab),
      searchQuery,
    );
  }, [
    allServersForFiltering,
    selectedCategoryIds,
    categories,
    activeTab,
    searchQuery,
    useClientSideFiltering,
  ]);

  const clientPaginationData = useMemo(() => {
    if (!useClientSideFiltering) return null;
    const totalFiltered = clientFilteredServers.length;
    const totalPagesFiltered = Math.ceil(totalFiltered / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      servers: clientFilteredServers.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE,
      ),
      total: totalFiltered,
      totalPages: totalPagesFiltered,
    };
  }, [clientFilteredServers, currentPage, useClientSideFiltering]);

  const displayData =
    useClientSideFiltering && clientPaginationData
      ? clientPaginationData
      : { servers, total, totalPages };

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

  const fetchServerPage = useCallback(
    async (page: number, tab: string) => {
      if (useClientSideFiltering) return;
      setIsLoading(true);
      try {
        const result = await getServersByCategoryAction(
          tab,
          page,
          ITEMS_PER_PAGE,
        );
        setServers(sortServersByCategory(result.servers, tab));
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setCurrentPage(page);
      } catch (error) {
        console.error('獲取伺服器數據失敗:', error);
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
        if (!useClientSideFiltering) fetchServerPage(page, activeTab);
        updateURL({ page: page.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },
    [useClientSideFiltering, activeTab, fetchServerPage, updateURL],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      startTransition(() => {
        setActiveTab(value);
        setCurrentPage(1);
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 200);
        if (!useClientSideFiltering) fetchServerPage(1, value);
        updateURL({ tab: value, page: '1' });
      });
    },
    [useClientSideFiltering, fetchServerPage, updateURL],
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
      totalServers: allServersForFiltering.length,
      featuredServers: allServersForFiltering.filter(
        server => server.members >= 1000,
      ).length,
      totalTags: allServersForFiltering.reduce(
        (total, server) =>
          total + (Array.isArray(server.tags) ? server.tags.length : 0),
        0,
      ),
    }),
    [allServersForFiltering],
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

  const shouldShowSkeleton = isLoading || isSearching || isPending;

  // --- Render ---
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
              onChange={handleSearchChange}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
              size={20}
            />
            {(isSearching || isPending) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile Category Filter */}
        <div className="lg:hidden mb-6">
          <MobileCategoryFilter
            categories={categories}
            onCategoryChange={handleCategoryChange}
            onCustomCategoryAdd={handleAddCustomCategory}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            {useClientSideFiltering && (
              <div className="mb-4 p-3 bg-[#2b2d31] rounded-lg text-sm text-gray-300">
                {searchQuery && <span>搜尋「{searchQuery}」</span>}
                {selectedCategoryIds.length > 0 && (
                  <span>
                    {searchQuery && ' · '}
                    已選擇 {selectedCategoryIds.length} 個分類
                  </span>
                )}
                <span className="ml-2">找到 {displayData.total} 個結果</span>
              </div>
            )}

            <Tabs
              className="mb-8"
              value={activeTab}
              onValueChange={handleTabChange}
            >
              <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full h-full overflow-x-auto overflow-y-auto">
                <TabsTrigger
                  value="popular"
                  className="data-[state=active]:bg-[#36393f]"
                  disabled={isPending}
                >
                  熱門伺服器
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  className="data-[state=active]:bg-[#36393f]"
                  disabled={isPending}
                >
                  精選伺服器
                </TabsTrigger>
                <TabsTrigger
                  value="new"
                  className="data-[state=active]:bg-[#36393f]"
                  disabled={isPending}
                >
                  最新伺服器
                </TabsTrigger>
                <TabsTrigger
                  value="voted"
                  className="data-[state=active]:bg-[#36393f]"
                  disabled={isPending}
                >
                  票選伺服器
                </TabsTrigger>
              </TabsList>
              {['featured', 'popular', 'new', 'voted'].map(tabValue => (
                <TabsContent key={tabValue} value={tabValue} className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">
                      {tabValue === 'featured' && '精選伺服器'}
                      {tabValue === 'popular' && '熱門伺服器'}
                      {tabValue === 'new' && '最新伺服器'}
                      {tabValue === 'voted' && '票選伺服器'}
                    </h2>
                    {!shouldShowSkeleton && displayData.total > 0 && (
                      <div className="text-sm text-gray-400">
                        第 {currentPage} 頁，共 {displayData.totalPages} 頁
                      </div>
                    )}
                  </div>
                  <ServerList
                    servers={displayData.servers}
                    isLoading={shouldShowSkeleton}
                    skeletonCount={ITEMS_PER_PAGE}
                  />
                  {!shouldShowSkeleton && displayData.totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={displayData.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Sidebar */}
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
                  <span className="font-medium">{stats.totalServers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">總精選伺服器數量</span>
                  <span className="font-medium">{stats.featuredServers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">目前已被使用的分類總數</span>
                  <span className="font-medium">{stats.totalTags}</span>
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

        {/* Mobile Add Server Button */}
        <div className="lg:hidden mt-8">
          <div className="bg-[#2b2d31] rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">新增您的伺服器</h3>
            <p className="text-gray-300 text-sm mb-4">
              想要推廣您的 Discord
              伺服器嗎？立即加入我們的平台，讓更多人發現您的社群！
            </p>
            <Link href="/add-server" target="_blank" rel="noopener noreferrer">
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
