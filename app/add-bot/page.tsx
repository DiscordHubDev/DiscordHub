"use client";
import React, { useState } from "react";
import {
  useForm,
  Controller,
  UseFormRegister,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Trash, Trash2, Upload, Info } from "lucide-react";
import { botFormSchema } from "@/schemas/add-bot-schema";
import { botCategories } from "@/lib/bot-categories";
import { z } from "zod";
import { TagField } from "@/components/ui/form/bot-form/TagField";
import { CommandListField } from "@/components/ui/form/bot-form/CommandListField";
import { DeveloperListField } from "@/components/ui/form/bot-form/DeveloperListField";
import { DiscordBotRPCInfo } from "@/lib/types";
import { submitBot } from "@/lib/actions/submit-bot";
import { BotWithRelationsInput } from "@/lib/prisma_type";
import { getColorFromURL } from "color-thief-node";
import { rgbToHex } from "@/lib/utils";

type FormData = z.infer<typeof botFormSchema>;

const BotForm: React.FC = () => {
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(botFormSchema),
    mode: "onChange",
    defaultValues: {
      botName: "",
      botPrefix: "",
      botDescription: "",
      botLongDescription: "",
      botInvite: "",
      botWebsite: "",
      botSupport: "",
      developers: [],
      commands: [],
      tags: [],
    },
  });

  const [loading, setLoading] = useState(false);
  const [botInfo, setBotInfo] = useState<DiscordBotRPCInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { handleSubmit, control, formState, register, reset } = form;

  const handleScreenshotUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      const previews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setScreenshotPreviews([...screenshotPreviews, ...previews]);
    }
  };

  const removeScreenshot = (index: number) => {
    const newPreviews = [...screenshotPreviews];
    newPreviews.splice(index, 1);
    setScreenshotPreviews(newPreviews);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const client_id = new URL(data.botInvite).searchParams.get("client_id");

    if (!client_id) {
      setError(":x: 無法解析 bot invite link 中的 client_id");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `https://discord.com/api/v10/applications/${client_id.trim()}/rpc`,
        {
          headers: {
            "User-Agent": "DiscordHubs/1.0",
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          `找不到此 Bot 或 Discord API 錯誤 (status: ${res.status})`
        );
      }

      const rpcData: DiscordBotRPCInfo = await res.json();
      setBotInfo(rpcData);

      const commandPayload = data.commands.map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        usage: cmd.usage,
        category: cmd.category ?? null,
        botId: client_id,
      }));

      const icon = `https://cdn.discordapp.com/app-icons/${client_id}/${rpcData.icon}.png`;

      const hexColor = await getColorFromURL(icon).then((rgb) => rgbToHex(rgb));

      const botData: BotWithRelationsInput = {
        id: client_id,
        name: data.botName,
        description: data.botDescription,
        longDescription: data.botLongDescription || null,
        tags: data.tags,
        servers: 0,
        users: 0,
        upvotes: 0,
        icon: icon,
        banner: hexColor,
        featured: false,
        createdAt: new Date(),
        prefix: data.botPrefix,
        developers: data.developers.map((dev) => ({ id: dev.name })),
        website: data.botWebsite || null,
        status: "pending",
        inviteUrl: data.botInvite,
        supportServer: data.botSupport || null,
        verified: false,
        features: [],
        screenshots: screenshotPreviews,
        commands: commandPayload,
      };

      try {
        await submitBot(botData);
        reset();
        setSuccess(true);
      } catch (err) {
        console.error(err);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#2b2d31] rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">新增您的 Discord 機器人</h1>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 基本資訊 */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">基本資訊</h2>

                <FormField
                  control={control}
                  name="botName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>機器人名稱 *</FormLabel>
                      <FormControl>
                        <Input placeholder="輸入您的機器人名稱" {...field} />
                      </FormControl>
                      <FormMessage>
                        {formState.errors.botName?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="botPrefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>機器人前綴 *</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：! 或 /" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="botDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>簡短描述 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="簡短描述您的機器人功能（最多 200 字）"
                          maxLength={200}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="botLongDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>詳細描述</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="詳細描述您的機器人功能、特色等（最多 2000 字）"
                          maxLength={2000}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="botInvite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>機器人邀請連結 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例如：https://discord.com/oauth2/authorize?client_id=..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="botWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>網站連結</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例如：https://example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="botSupport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>支援伺服器連結</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例如：https://discord.gg/example"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 開發者列表 */}
                <DeveloperListField />

                {/* 標籤 */}
                <TagField name="tags" categories={botCategories} />

                {/* 指令列表 */}
                <CommandListField />

                {/* 圖片上傳 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">圖片上傳</h2>

                  {/* 機器人截圖 */}
                  <div className="space-y-10 mt-4">
                    <FormLabel htmlFor="bot-screenshots">
                      機器人截圖（最多 5 張）
                    </FormLabel>
                    <div className="flex flex-col gap-3">
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
                              id="bot-screenshots"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handleScreenshotUpload}
                            />
                            <FormLabel
                              htmlFor="bot-screenshots"
                              className="cursor-pointer flex flex-col items-center text-gray-400 hover:text-white"
                            >
                              <Upload size={24} />
                              <span className="mt-2 text-sm">上傳截圖</span>
                            </FormLabel>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        上傳您機器人的截圖，展示機器人的功能和使用場景
                      </p>
                    </div>
                  </div>
                </div>

                {/* 提交按鈕 */}
                <div className="flex items-center justify-between pt-4 border-t border-[#1e1f22]">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-[#5865f2] mt-0.5" />
                    <p className="text-sm text-gray-400">
                      提交後，我們將審核您的機器人。審核通常需要 1-2 個工作日。
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="relative discord text-white px-4 py-2 rounded disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading && (
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    )}
                    {loading ? "提交中..." : "提交機器人"}
                  </Button>
                </div>
                {error && <p className="text-red-500">{error}</p>}
              </div>
            </form>
          </Form>
          {success && (
            <div className="mt-4 text-green-500 text-sm border border-green-500 bg-green-100/10 rounded p-3">
              ✅ 機器人已成功新增，請等待管理員審核！
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotForm;
