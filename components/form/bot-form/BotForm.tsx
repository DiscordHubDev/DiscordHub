'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  deleteCloudinaryImage,
  getCloudinarySignature,
} from '@/lib/actions/image';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Info } from 'lucide-react';
import { botFormSchema } from '@/schemas/add-bot-schema';
import { botCategories } from '@/lib/bot-categories';
import { z } from 'zod';
import { TagField } from '@/components/form/bot-form/TagField';
import { CommandListField } from '@/components/form/bot-form/CommandListField';
import { DeveloperListField } from '@/components/form/bot-form/DeveloperListField';
import { Screenshot } from '@/lib/types';
import ScreenshotGrid from '@/components/form/bot-form/ScreenshotGrid';

type FormData = z.infer<typeof botFormSchema>;

type BotFormProps = {
  mode?: 'create' | 'edit';
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData, screenshots: Screenshot[]) => Promise<void>;
};

const BotForm: React.FC<BotFormProps> = ({
  mode = 'create',
  defaultValues,
  onSubmit,
}) => {
  const [screenshotPreviews, setScreenshotPreviews] = useState<Screenshot[]>(
    [],
  );
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(botFormSchema),
    mode: 'onChange',
    defaultValues: {
      botName: '',
      botPrefix: '',
      botDescription: '',
      botLongDescription: '',
      botInvite: '',
      botWebsite: '',
      botSupport: '',
      developers: [],
      commands: [],
      tags: [],
      webhook_url: '',
      secret: '',
      ...(defaultValues || {}),
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { handleSubmit, control, formState, register, reset } = form;

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

  const onSubmitHandler = async (data: FormData) => {
    try {
      setLoading(true);
      console.log('表單資料:', data);
      await onSubmit(data, screenshotPreviews);
      setLoading(false);
      if (mode === 'create') reset();
      setScreenshotPreviews([]);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#2b2d31] rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">
            {mode === 'edit' ? '編輯' : '新增'}您的 Discord 機器人
          </h1>
          <Form {...form}>
            <form
              onKeyDown={e => {
                if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                  e.preventDefault();
                }
              }}
              onSubmit={handleSubmit(onSubmitHandler)}
              className="space-y-6"
            >
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
                      <FormLabel>詳細描述 *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={10}
                          placeholder="請輸入詳細描述"
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

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">投票通知</h2>

                  <FormField
                    control={form.control}
                    name="secret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Secret（觸發投票時，Secret會加到 Auth
                          Header，用來驗證請求是從這裡送出）
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="輸入 Secret" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="webhook_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Webhook URL（輸入 Discord Webhook
                          時會送出美化的投票通知 Embed，自訂 Web Server
                          則會接收到 JSON 格式的資料）
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://your-webhook.url"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 圖片上傳 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">圖片上傳</h2>

                  {/* 機器人截圖 */}
                  <div className="space-y-10 mt-4">
                    <FormLabel htmlFor="bot-screenshots">
                      機器人截圖（最多 5 張）
                    </FormLabel>
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
                        上傳您機器人的截圖，展示機器人的功能和使用場景
                      </p>
                    </div>
                  </div>
                </div>

                {/* 提交按鈕 */}
                <div className="flex items-center justify-between pt-4 border-t border-[#1e1f22]">
                  <div className="flex items-center justify-between pt-4 border-t border-[#1e1f22]">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="text-[#5865f2] mt-0.5" />
                      <p className="text-sm text-gray-400">
                        {mode === 'edit'
                          ? '保存後，變更可能需要一段時間才會顯示在平台上。'
                          : '提交後，我們將審核您的機器人。審核通常需要 1-2 個工作日。'}
                      </p>
                    </div>
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
                    {loading
                      ? mode === 'edit'
                        ? '儲存中...'
                        : '提交中...'
                      : mode === 'edit'
                        ? '保存變更'
                        : '提交機器人'}
                  </Button>
                </div>
                {error && <p className="text-red-500">{error}</p>}
              </div>
            </form>
          </Form>
          {success && (
            <div className="mt-4 text-green-500 text-sm border border-green-500 bg-green-100/10 rounded p-3">
              {mode === 'create'
                ? '✅ 機器人已成功新增，請等待管理員審核！'
                : '機器人已成功保存！'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotForm;
