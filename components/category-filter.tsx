'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import type { CategoryType } from '@/lib/types';
import Pagination from '@/components/pagination';
interface CategoryFilterProps {
  categories: CategoryType[];
  onCategoryChange?: (selectedCategories: string[]) => void;
}

export default function CategoryFilter({
  categories: initialCategories,
  onCategoryChange,
}: CategoryFilterProps) {
  const [categories, setCategories] =
    useState<CategoryType[]>(initialCategories);

  const [currentPage, setCurrentPage] = useState(1);

  // 每頁顯示的分類數量
  const CATEGORIES_PER_PAGE = 10;

  // 計算總頁數
  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);

  // 獲取當前頁的分類
  const getCurrentPageCategories = () => {
    const startIndex = (currentPage - 1) * CATEGORIES_PER_PAGE;
    const endIndex = startIndex + CATEGORIES_PER_PAGE;
    return categories.slice(startIndex, endIndex);
  };

  const toggleCategory = (id: string) => {
    const updatedCategories = categories.map(category =>
      category.id === id
        ? { ...category, selected: !category.selected }
        : category,
    );

    setCategories(updatedCategories);

    if (onCategoryChange) {
      const selectedCategoryIds = updatedCategories
        .filter(cat => cat.selected)
        .map(cat => cat.id);

      onCategoryChange(selectedCategoryIds);
    }
  };

  // 處理頁面變更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-2">
      {getCurrentPageCategories().map(category => (
        <div
          key={category.id}
          className="flex items-center justify-between p-2 rounded hover:bg-[#36393f] cursor-pointer transition-colors"
          onClick={() => toggleCategory(category.id)}
          role="button"
          tabIndex={0}
          aria-pressed={category.selected}
        >
          <div className="flex items-center">
            <span
              className={`w-2 h-2 rounded-full mr-2 ${category.color}`}
            ></span>
            <span>{category.name}</span>
          </div>
          <div
            className={`w-5 h-5 rounded border ${
              category.selected
                ? 'border-[#5865f2] bg-[#5865f2]/10'
                : 'border-gray-600'
            } flex items-center justify-center transition-colors`}
          >
            {category.selected && (
              <Check size={14} className="text-[#5865f2]" />
            )}
          </div>
        </div>
      ))}

      {/* 分頁控制器 - 只有當總頁數大於1時才顯示 */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
