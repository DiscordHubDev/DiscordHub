// components/form/TagField.tsx
"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

type BotCategory = {
  id: string;
  name: string;
  color: string;
};

interface TagFieldProps {
  name: string;
  categories: BotCategory[];
}

export const TagField: React.FC<TagFieldProps> = ({ name, categories }) => {
  const { control, setValue } = useFormContext();
  const selectedTags: string[] = useWatch({ control, name }) ?? [];
  const [customTag, setCustomTag] = useState("");

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setValue(
        name,
        selectedTags.filter((t) => t !== tag),
        { shouldValidate: true }
      );
    } else {
      if (selectedTags.length < 5) {
        setValue(name, [...selectedTags, tag], {
          shouldValidate: true,
        });
      }
    }
  };

  const handleAddCustomTag = () => {
    if (
      customTag.trim() !== "" &&
      !selectedTags.includes(customTag) &&
      selectedTags.length < 5
    ) {
      setValue(name, [...selectedTags, customTag.trim()], {
        shouldValidate: true,
      });
      setCustomTag("");
    }
  };

  return (
    <FormField
      name={name}
      render={() => (
        <FormItem className="space-y-4">
          <div>
            <FormLabel className="text-xl font-semibold">標籤</FormLabel>
            <p className="text-sm text-gray-400">
              選擇最能描述您機器人的標籤（最多 5 個）
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={
                  selectedTags.includes(category.name) ? "default" : "secondary"
                }
                className={`cursor-pointer ${
                  selectedTags.includes(category.name)
                    ? "bg-[#5865f2] hover:bg-[#4752c4]"
                    : "bg-[#36393f] hover:bg-[#4f545c]"
                }`}
                onClick={() => toggleTag(category.name)}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-1.5 ${category.color}`}
                />
                {category.name}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="添加自定義標籤"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="bg-[#36393f] border-[#1e1f22] text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomTag();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddCustomTag}
              className="bg-[#5865f2] hover:bg-[#4752c4]"
            >
              <Plus size={16} />
            </Button>
          </div>

          {selectedTags.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-2">已選擇的標籤：</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-[#5865f2] hover:bg-[#4752c4] flex items-center gap-1"
                  >
                    {tag}
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
