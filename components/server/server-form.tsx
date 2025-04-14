'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { Servercategories } from '@/lib/categories';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ServerTagField } from '@/components/form/server-form/ServerTagField';
import { ServerFormSchema } from '@/schemas/add-server-schema';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';
import { ActiveServerInfo } from '@/lib/get-user-guild';
import {
  deleteCloudinaryImage,
  getCloudinarySignature,
} from '@/lib/actions/image';
import ScreenshotGrid from '../form/bot-form/ScreenshotGrid';
import { CreateServerInput, ServerType } from '@/lib/prisma_type';
import { RulesField } from '../form/server-form/RulesField';
import {
  insertServer,
  isOwnerexist,
  updateServer,
} from '@/lib/actions/servers';
import { fetchUserInfo } from '@/lib/utils';

type FormSchemaType = z.infer<typeof ServerFormSchema>;

type Screenshot = {
  url: string;
  public_id: string;
};

type ServerFormProps = {
  server?: ActiveServerInfo;
  edit_server?: ServerType;
  mode: 'create' | 'edit';
};

const webhookUrl =
  'https://discord.com/api/webhooks/1361334441498378452/pa6cNfNoKTo8tpB_ClSzVZhqnO0DoAjNZ_INJYwPPEvAcT7RkjZLN-H5BQqNSSW_TTUf';

export default function ServerFormPage({
  server,
  edit_server,
  mode,
}: ServerFormProps) {
  const [screenshotPreviews, setScreenshotPreviews] = useState<Screenshot[]>(
    [],
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(ServerFormSchema),
    mode: 'onChange',
    defaultValues: {
      serverName: edit_server?.name || server?.name,
      shortDescription: edit_server?.description || '',
      longDescription: edit_server?.longDescription || '',
      inviteLink: edit_server?.inviteUrl || '',
      websiteLink: edit_server?.website || '',
      tags: edit_server?.tags || [],
      rules: edit_server?.rules || [],
    },
  });

  const { handleSubmit, control, formState, register, reset, getValues } = form;

  const handleScreenshotUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, 5 - screenshotPreviews.length);
    if (fileArray.length === 0) return;

    setUploading(true);

    const sig = await getCloudinarySignature();
    console.log('簽名資訊', sig);

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.apiKey);
      formData.append('timestamp', sig.timestamp.toString());
      formData.append('signature', sig.signature);
      formData.append('upload_preset', sig.uploadPreset);

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          },
        );

        const data = await res.json();

        if (!res.ok) {
          console.error('上傳失敗', {
            status: res.status,
            statusText: res.statusText,
            body: data,
          });
          continue;
        }

        const imageUrl = data.secure_url;
        const publicId = data.public_id;

        setScreenshotPreviews(prev => [
          ...prev,
          { url: imageUrl, public_id: publicId },
        ]);
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }

    setUploading(false);
  };

  const removeScreenshot = async (index: number) => {
    const toDelete = screenshotPreviews[index];
    setScreenshotPreviews(prev => prev.filter((_, i) => i !== index));

    try {
      await deleteCloudinaryImage(toDelete.public_id);
      console.log('圖片已從 Cloudinary 刪除');
    } catch (err) {
      console.error('刪除失敗', err);
    }
  };

  const onSubmit = async (data: FormSchemaType) => {
    setLoading(true);
    setError(null);

    const activeServer = server ?? edit_server;
    if (!activeServer) {
      setError('找不到伺服器資料');
      return;
    }

    try {
      let avatar: string = '';
      let banner: string | null = null;
      let global_name: string = '未知使用者';

      const memberCount =
        'memberCount' in activeServer ? activeServer.memberCount : 0;
      const onlineCount =
        'OnlineMemberCount' in activeServer
          ? activeServer.OnlineMemberCount
          : 0;

      const ownerId =
        typeof activeServer.owner === 'string'
          ? activeServer.owner
          : activeServer.owner?.id;

      const existingOwner = await isOwnerexist(ownerId!);

      if (!existingOwner) {
        const userInfo = await fetchUserInfo(ownerId!);
        avatar = userInfo.avatar_url;
        banner = userInfo.banner_url;
        global_name = userInfo.global_name;
      }

      const payload: CreateServerInput = {
        id: activeServer.id,
        name: data.serverName,
        icon: activeServer.icon,
        banner: activeServer.banner,
        description: data.shortDescription,
        longDescription: data.longDescription,
        inviteUrl: data.inviteLink,
        website: data.websiteLink,
        tags: data.tags,
        members: memberCount,
        online: onlineCount,
        rules: data.rules,
        upvotes: 0,
        owner: {
          connectOrCreate: {
            where: { id: ownerId },
            create: {
              id: ownerId,
              username: global_name,
              avatar: avatar,
              banner: banner,
            },
          },
        },
      };

      if (mode === 'edit') {
        await updateServer(payload);
      } else {
        await insertServer(payload);
      }

      // Webhook 消息
      const embed = {
        title: `<:pixel_symbol_exclamation_invert:1361299311131885600> | 新發佈的伺服器！`,
        description: `➤伺服器名稱：**${data.serverName}**\n➤簡短描述：\n\`\`\`${data.shortDescription}\`\`\`\n➤邀請連結：\n> **${data.inviteLink}**\n➤網站連結：\n> **https://dchubs.org/servers/${activeServer?.id || '無'}**\n➤類別：\n\`\`\`${data.tags.join('\n')}\`\`\``,
        color: 0x4285f4,
        thumbnail: {
          url: activeServer?.icon || '',
        },
        image: {
          url: activeServer?.banner || '',
        },
        footer: {
          text: 'Discord Hubs',
        },
      };

      const webhookData = {
        embeds: [embed],
        username: 'DcHubs伺服器通知',
        avatar_url:
          'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
      };

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        });

        if (!response.ok) {
          console.error('Webhook 發送失敗:', response.statusText);
        } else {
          console.log('Webhook 發送成功');
        }
      } catch (webhookError) {
        console.error('發送 Webhook 時出錯:', webhookError);
      }

      setSuccess(true);
      reset();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? '發生未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  // const handleTestWebhook = async () => {
  //   const data = getValues();
  //   const activeServer = server ?? edit_server;

  //   const embed = {
  //     title: `<:pixel_symbol_exclamation_invert:1361299311131885600> | 新發佈的伺服器！`,
  //     description: `➤伺服器名稱：**${data.serverName}**\n➤簡短描述：\n\`\`\`${data.shortDescription}\`\`\`\n➤邀請連結：\n> **${data.inviteLink}**\n➤網站連結：\n> **https://dchubs.org/servers/${activeServer?.id || '無'}**\n➤類別：\n\`\`\`${data.tags.join('\n')}\`\`\``,
  //     color: 0x4285f4,
  //     thumbnail: {
  //       url: activeServer?.icon || '',
  //     },
  //     image: {
  //       url: activeServer?.banner || '',
  //     },
  //     footer: {
  //       text: 'Discord Hubs',
  //     },
  //   };

  //   const webhookData = {
  //     embeds: [embed],
  //     username: 'DcHubs伺服器通知',
  //     avatar_url:
  //       'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
  //   };

  //   try {
  //     const response = await fetch(webhookUrl, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(webhookData),
  //     });

  //     if (!response.ok) {
  //       console.error('Webhook 發送失敗:', response.statusText);
  //     } else {
  //       console.log('Webhook 發送成功');
  //     }
  //   } catch (webhookError) {
  //     console.error('發送 Webhook 時出錯:', webhookError);
  //   }
  // };

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
                          disabled
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
                      <Label htmlFor="server-long-description">
                        詳細描述 *
                      </Label>
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

              <RulesField />

              {/* 標籤 */}
              <ServerTagField name="tags" categories={Servercategories} />

              {/* 圖片上傳 */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">圖片上傳</h2>

                {/* 伺服器截圖 */}
                <div className="space-y-10 mt-4">
                  <Label htmlFor="server-screenshots">
                    伺服器截圖（最多 5 張）
                  </Label>
                  <div className="flex flex-col gap-3">
                    <ScreenshotGrid
                      screenshotPreviews={screenshotPreviews.map(p => p.url)}
                      removeScreenshot={removeScreenshot}
                    />
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
                    <p className="text-xs text-gray-400">
                      上傳您伺服器的截圖，展示伺服器的特色和活動
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center pt-4 border-t border-[#1e1f22] space-y-2">
                {/* <Button
                  type="button"
                  onClick={handleTestWebhook}
                  className="relative discord text-white px-4 py-2 rounded flex items-center justify-center"
                >
                  測試 Webhook
                </Button> */}
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
                  {loading
                    ? mode === 'edit'
                      ? '儲存中...'
                      : '提交中...'
                    : mode === 'edit'
                      ? '儲存變更'
                      : '提交伺服器'}
                </Button>
                {error && <p className="text-red-500">{error}</p>}
              </div>
            </form>
          </Form>
          {success && (
            <div className="... text-green-500">
              {mode === 'edit'
                ? '✅ 伺服器資訊已更新！'
                : '✅ 伺服器已經提交成功！'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
