"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Plus, Info } from "lucide-react";
import { categories } from "@/lib/mock-data";

export default function AddServerPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  // 處理標籤選擇
  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  // 處理自定義標籤添加
  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag("");
    }
  };

  // 處理圖標上傳
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 處理橫幅上傳
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 處理截圖上傳
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPreviews: string[] = [];

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string);
            if (newPreviews.length === files.length) {
              setScreenshotPreviews([...screenshotPreviews, ...newPreviews]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 移除截圖
  const removeScreenshot = (index: number) => {
    setScreenshotPreviews(screenshotPreviews.filter((_, i) => i !== index));
  };

  // 提交表單
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 在實際應用中，這裡會處理表單提交邏輯
    alert("伺服器提交成功！（模擬）");
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
                      className="text-white hover:bg-[#36393f]"
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
                  <Link href="/add-server" passHref>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-[#36393f] bg-[#36393f]"
                    >
                      新增伺服器
                    </Button>
                  </Link>
                  <Link href="/add-bot" passHref>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-[#36393f]"
                    >
                      新增機器人
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Link href="/profile">
                <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                  個人資料
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#2b2d31] rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">新增您的 Discord 伺服器</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本資訊 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">基本資訊</h2>

              <div className="space-y-2">
                <Label htmlFor="server-name">伺服器名稱 *</Label>
                <Input
                  id="server-name"
                  placeholder="輸入您的伺服器名稱"
                  required
                  className="bg-[#36393f] border-[#1e1f22] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-description">簡短描述 *</Label>
                <Textarea
                  id="server-description"
                  placeholder="簡短描述您的伺服器（最多 200 字）"
                  maxLength={200}
                  required
                  className="bg-[#36393f] border-[#1e1f22] text-white resize-none h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-long-description">詳細描述</Label>
                <Textarea
                  id="server-long-description"
                  placeholder="詳細描述您的伺服器，包括特色、規則等（最多 2000 字）"
                  maxLength={2000}
                  className="bg-[#36393f] border-[#1e1f22] text-white resize-none h-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-invite">Discord 邀請連結 *</Label>
                <Input
                  id="server-invite"
                  placeholder="例如：https://discord.gg/example"
                  required
                  className="bg-[#36393f] border-[#1e1f22] text-white"
                />
                <p className="text-xs text-gray-400">請確保邀請連結永久有效</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-website">網站連結</Label>
                <Input
                  id="server-website"
                  placeholder="例如：https://example.com"
                  className="bg-[#36393f] border-[#1e1f22] text-white"
                />
              </div>
            </div>

            {/* 標籤 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">標籤</h2>
              <p className="text-sm text-gray-400">
                選擇最能描述您伺服器的標籤（最多 5 個）
              </p>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={
                      selectedTags.includes(category.name)
                        ? "default"
                        : "secondary"
                    }
                    className={`cursor-pointer ${
                      selectedTags.includes(category.name)
                        ? "bg-[#5865f2] hover:bg-[#4752c4]"
                        : "bg-[#36393f] hover:bg-[#4f545c]"
                    }`}
                    onClick={() => handleTagToggle(category.name)}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-1.5 ${category.color}`}
                    ></span>
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
                          onClick={() => handleTagToggle(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 圖片上傳 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">圖片上傳</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 伺服器圖標 */}
                <div className="space-y-2">
                  <Label htmlFor="server-icon">伺服器圖標</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-[#36393f] rounded-full overflow-hidden flex items-center justify-center border border-[#1e1f22]">
                      {iconPreview ? (
                        <img
                          src={iconPreview || "/placeholder.svg"}
                          alt="Server icon preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload size={24} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="server-icon"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleIconUpload}
                      />
                      <Label
                        htmlFor="server-icon"
                        className="bg-[#36393f] text-white hover:bg-[#4f545c] px-4 py-2 rounded cursor-pointer inline-block"
                      >
                        選擇圖片
                      </Label>
                      <p className="text-xs text-gray-400 mt-1">
                        建議尺寸：512x512 像素
                      </p>
                    </div>
                  </div>
                </div>

                {/* 伺服器橫幅 */}
                <div className="space-y-2">
                  <Label htmlFor="server-banner">伺服器橫幅</Label>
                  <div className="flex flex-col gap-2">
                    <div className="h-32 bg-[#36393f] rounded overflow-hidden flex items-center justify-center border border-[#1e1f22]">
                      {bannerPreview ? (
                        <img
                          src={bannerPreview || "/placeholder.svg"}
                          alt="Server banner preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload size={24} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Input
                        id="server-banner"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerUpload}
                      />
                      <Label
                        htmlFor="server-banner"
                        className="bg-[#36393f] text-white hover:bg-[#4f545c] px-4 py-2 rounded cursor-pointer inline-block"
                      >
                        選擇圖片
                      </Label>
                      <p className="text-xs text-gray-400 mt-1">
                        建議尺寸：960x540 像素
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 伺服器截圖 */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="server-screenshots">
                  伺服器截圖（最多 5 張）
                </Label>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {screenshotPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-32 object-cover rounded border border-[#1e1f22]"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-[#1e1f22] text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeScreenshot(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {screenshotPreviews.length < 5 && (
                      <div className="h-32 bg-[#36393f] rounded border border-dashed border-[#4f545c] flex items-center justify-center">
                        <Input
                          id="server-screenshots"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleScreenshotUpload}
                        />
                        <Label
                          htmlFor="server-screenshots"
                          className="cursor-pointer flex flex-col items-center text-gray-400 hover:text-white"
                        >
                          <Upload size={24} />
                          <span className="mt-2 text-sm">上傳截圖</span>
                        </Label>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    上傳您伺服器的截圖，展示伺服器的特色和活動
                  </p>
                </div>
              </div>
            </div>

            {/* 提交按鈕 */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1e1f22]">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-[#5865f2] mt-0.5" />
                <p className="text-sm text-gray-400">
                  提交後，我們將審核您的伺服器。審核通常需要 1-2 個工作日。
                </p>
              </div>
              <Button type="submit" className="bg-[#5865f2] hover:bg-[#4752c4]">
                提交伺服器
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
