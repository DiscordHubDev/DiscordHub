"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Upload, Plus, Info } from "lucide-react";
import { Servercategories } from "@/lib/mock-data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ServerTagField } from "@/components/ui/form/server-form/ServerTagField";
import { ServerFormSchema } from "@/schemas/add-server-schema";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type FormSchemaType = z.infer<typeof ServerFormSchema>;

export default function AddServerFormPage() {
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(ServerFormSchema),
    mode: "onChange",
    defaultValues: {
      serverName: "",
      shortDescription: "",
      longDescription: "",
      inviteLink: "",
      websiteLink: "",
      servertags: [],
    },
  });

  const { handleSubmit, control, formState, register } = form;

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
  const onSubmit = (data: FormSchemaType) => {
    // 在實際應用中，這裡會處理表單提交邏輯
    console.log("Form Data:", data);
    alert("伺服器提交成功！（模擬）");
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#2b2d31] rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">新增您的 Discord 伺服器</h1>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 基本資訊 */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">基本資訊</h2>

                <FormField
                  control={control}
                  name="serverName"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="server-name">伺服器名稱 *</Label>
                      <FormControl>
                        <Input
                          id="server-name"
                          placeholder="輸入您的伺服器名稱"
                          className="bg-[#36393f] border-[#1e1f22] text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="server-description">簡短描述 *</Label>
                      <FormControl>
                        <Textarea
                          id="server-description"
                          placeholder="簡短描述您的伺服器（最多 200 字）"
                          maxLength={200}
                          className="bg-[#36393f] border-[#1e1f22] text-white resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="longDescription"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="server-long-description">詳細描述</Label>
                      <FormControl>
                        <Textarea
                          id="server-long-description"
                          placeholder="詳細描述您的伺服器，包括特色、規則等（最多 2000 字）"
                          maxLength={2000}
                          className="bg-[#36393f] border-[#1e1f22] text-white resize-none h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="inviteLink"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="server-invite">Discord 邀請連結 *</Label>
                      <FormControl>
                        <Input
                          id="server-invite"
                          placeholder="例如：https://discord.gg/example"
                          className="bg-[#36393f] border-[#1e1f22] text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-400 mt-1">
                        請確保邀請連結永久有效
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="websiteLink"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="server-website">網站連結</Label>
                      <FormControl>
                        <Input
                          id="server-website"
                          placeholder="例如：https://example.com"
                          className="bg-[#36393f] border-[#1e1f22] text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 標籤 */}
              <ServerTagField name="servertags" categories={Servercategories} />

              {/* 圖片上傳 */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">圖片上傳</h2>

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
                <Button
                  type="submit"
                  className="bg-[#5865f2] hover:bg-[#4752c4]"
                >
                  提交伺服器
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
