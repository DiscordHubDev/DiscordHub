'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import type { CategoryType } from '@/lib/types';

interface MobileCategoryFilterProps {
  categories: CategoryType[];
  onCategoryChange?: (selectedCategories: string[]) => void;
  onCustomCategoryAdd?: (categoryName: string) => void;
}

export default function MobileCategoryFilter({
  categories: initialCategories,
  onCategoryChange,
  onCustomCategoryAdd,
}: MobileCategoryFilterProps) {
  const [categories, setCategories] =
    useState<CategoryType[]>(initialCategories);
  const [showAll, setShowAll] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

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

  // 添加自定義分類
  const handleAddCustomCategory = () => {
    if (!customCategory.trim() || !onCustomCategoryAdd) return;

    onCustomCategoryAdd(customCategory.trim());
    setCustomCategory('');
  };

  const displayCategories = showAll ? categories : categories.slice(0, 6);

  return (
    <div className="bg-[#2b2d31] rounded-lg p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">分類</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-gray-400"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? '收起' : '查看所有分類'}
        </Button>
      </div>

      {/* 自定義分類輸入 */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="新增自定義分類..."
          value={customCategory}
          onChange={e => setCustomCategory(e.target.value)}
          className="bg-[#36393f] border-[#1e1f22] text-white placeholder:text-gray-400"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustomCategory();
            }
          }}
        />
        <Button
          size="icon"
          onClick={handleAddCustomCategory}
          className="bg-[#5865f2] hover:bg-[#4752c4]"
        >
          <Plus size={16} />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {displayCategories.map(category => (
          <Badge
            key={category.id}
            variant="secondary"
            className={`bg-[#36393f] hover:bg-[#4f545c] text-gray-300 cursor-pointer transition-all ${
              category.selected ? 'border border-[#5865f2] bg-[#5865f2]/10' : ''
            }`}
            onClick={() => toggleCategory(category.id)}
          >
            <span
              className={`w-2 h-2 rounded-full mr-1.5 ${category.color}`}
            ></span>
            {category.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
