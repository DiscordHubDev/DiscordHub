"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import type { CategoryType } from "@/lib/types"

interface CategoryFilterProps {
  categories: CategoryType[]
  onCategoryChange?: (selectedCategories: string[]) => void
}

export default function CategoryFilter({ categories: initialCategories, onCategoryChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<CategoryType[]>(initialCategories)

  const toggleCategory = (id: string) => {
    const updatedCategories = categories.map((category) =>
      category.id === id ? { ...category, selected: !category.selected } : category,
    )

    setCategories(updatedCategories)

    if (onCategoryChange) {
      const selectedCategoryIds = updatedCategories.filter((cat) => cat.selected).map((cat) => cat.id)

      onCategoryChange(selectedCategoryIds)
    }
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between p-2 rounded hover:bg-[#36393f] cursor-pointer transition-colors"
          onClick={() => toggleCategory(category.id)}
          role="button"
          tabIndex={0}
          aria-pressed={category.selected}
        >
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${category.color}`}></span>
            <span>{category.name}</span>
          </div>
          <div
            className={`w-5 h-5 rounded border ${category.selected ? "border-[#5865f2] bg-[#5865f2]/10" : "border-gray-600"} flex items-center justify-center transition-colors`}
          >
            {category.selected && <Check size={14} className="text-[#5865f2]" />}
          </div>
        </div>
      ))}
    </div>
  )
}

