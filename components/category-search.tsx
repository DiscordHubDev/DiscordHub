'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { CategoryType } from '@/lib/types';
import CategoryFilter from './category-filter';

interface CategorySearchProps {
  categories: CategoryType[];
  onCategoryChange?: (selectedCategories: string[]) => void;
}

export default function CategorySearch({
  categories,
  onCategoryChange,
}: CategorySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] =
    useState<CategoryType[]>(categories);

  // 過濾分類
  useEffect(() => {
    console.log('searchTerm', searchTerm);
    console.log('searchTerm.trim())', !searchTerm.trim());
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  return (
    <div className="space-y-4">
      {/* 搜尋現有分類 */}
      <div className="relative">
        <Input
          placeholder="搜尋分類..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-9 bg-[#36393f] border-[#1e1f22] text-white placeholder:text-gray-400"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
      </div>

      {/* 添加自定義分類
      <div className="flex gap-2">
        <Input
          placeholder="新增自定義分類（等待更新）"
          value={customCategory}
          onChange={e => setCustomCategory(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-[#36393f] border-[#1e1f22] text-white placeholder:text-gray-400"
        />
        <Button
          size="icon"
          onClick={handleAddCustomCategory}
          className="bg-[#5865f2] hover:bg-[#4752c4] "
        >
          <Plus className="text-gray-300" size={16} />
        </Button>
      </div> */}

      {/* 顯示過濾後的分類 */}
      {filteredCategories.length !== 0 ? (
        <div className="mt-4">
          <CategoryFilter
            key={filteredCategories.map(c => c.id).join(',')}
            categories={filteredCategories}
            onCategoryChange={onCategoryChange}
          />
        </div>
      ) : (
        <p className="text-gray-400 text-sm">沒有找到相符的分類</p>
      )}
    </div>
  );
}
