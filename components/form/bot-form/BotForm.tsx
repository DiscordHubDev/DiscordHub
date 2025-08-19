'use client';
import React, { useEffect, useRef, useState } from 'react';
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
import { Upload, Info, X } from 'lucide-react';
import { botFormSchema } from '@/schemas/add-bot-schema';
import { botCategories } from '@/lib/bot-categories';
import { z } from 'zod';
import { TagField } from '@/components/form/bot-form/TagField';
import { CommandListField } from '@/components/form/bot-form/CommandListField';
import { DeveloperListField } from '@/components/form/bot-form/DeveloperListField';
import { Screenshot } from '@/lib/types';
import ScreenshotGrid from '@/components/form/bot-form/ScreenshotGrid';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { toast } from 'react-toastify';
import { usePersistedFormField } from '@/hooks/use-field';
import { useError } from '@/context/ErrorContext';
import { sendPendingWebhook } from '@/lib/webhook';

const getBotAvatarUrl = async (botId: any) => {
  try {
    const response = await fetch(
      `https://dgsbotapi.vercel.app/v181cm/application/${botId}`,
    );
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    const data = await response.json();
    return data.icon;
  } catch (error) {
    console.error(error);
    return '';
  }
};

type FormData = z.infer<typeof botFormSchema>;

type BotFormProps = {
  mode?: 'create' | 'edit';
  defaultValues?: Partial<FormData>;
  onSubmit: (
    data: FormData,
    screenshots: Screenshot[],
    banner?: string,
  ) => Promise<void>;
};

const BotForm: React.FC<BotFormProps> = ({
  mode = 'create',
  defaultValues,
  onSubmit,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [screenshotPreviews, setScreenshotPreviews] = useState<Screenshot[]>(
    [],
  );

  const [bannerPreviews, setBannerPreviews] = useState<Screenshot[]>([]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (
      defaultValues?.screenshots &&
      Array.isArray(defaultValues.screenshots)
    ) {
      const previews = defaultValues.screenshots.map(url => {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];

        return {
          url,
          public_id: publicId,
        };
      });
      setScreenshotPreviews(previews);
    }
  }, [defaultValues?.screenshots]);

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
      secret: '',
      webhook_url: '',
      ...(defaultValues || {}),
    },
  });

  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { handleSubmit, control, formState, watch, reset } = form;

  const { showError } = useError();

  const longDescription = watch('botLongDescription');

  usePersistedFormField('longdesc', 'botLongDescription', form);
  usePersistedFormField('desc', 'botDescription', form);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    const textarea = textareaRef.current;
    const preview = previewRef.current;

    if (textarea && preview) {
      // 取得 textarea 的捲動百分比：
      // scrollTop 是目前捲動的距離，
      // scrollHeight 是內容總高度，
      // clientHeight 是可視範圍的高度
      const scrollRatio =
        textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);

      // 根據捲動比例，計算出 preview 應該捲到的高度：
      // 如果 textarea 捲了 50%，preview 也要捲到自己內容的 50%
      const previewScrollTop =
        scrollRatio * (preview.scrollHeight - preview.clientHeight);

      // 設定 preview 的捲動位置
      preview.scrollTop = previewScrollTop;
    }
  };

  const handleScreenshotUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    screenshots: Screenshot[],
    setPreviews: React.Dispatch<React.SetStateAction<Screenshot[]>>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
    const MAX_GIF_SIZE_BYTES = 10 * 1024 * 1024;
    const ALLOWED_IMAGE_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    const validFiles: File[] = [];
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.warn('請傳送動圖或者是一般圖片！');
        continue;
      }

      if (file.type === 'image/gif' && file.size > MAX_GIF_SIZE_BYTES) {
        toast.warn(
          `動圖 ${file.name} 大於 ${MAX_GIF_SIZE_BYTES / (1024 * 1024)}MB，請傳送更小的動圖。`,
        );
        continue;
      }

      if (file.type !== 'image/gif' && file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.warn(
          `圖片 ${file.name} 大於 ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB，請傳送更小的圖片。`,
        );

        continue;
      }

      validFiles.push(file);
    }

    const fileArray = validFiles.slice(0, 5 - screenshots.length);
    if (fileArray.length === 0) return;

    setUploading(true);

    const sig = await getCloudinarySignature();

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

        setPreviews(prev => [...prev, { url: imageUrl, public_id: publicId }]);
      } catch (error) {
        showError('未知錯誤');
        console.error('Unexpected error:', error);
      }
    }

    setUploading(false);
    event.target.value = '';
  };

  const removeScreenshot = async (
    index: number,
    screenshots: Screenshot[],
    setPreviews: React.Dispatch<React.SetStateAction<Screenshot[]>>,
  ) => {
    const toDelete = screenshots[index];
    setPreviews(prev => prev.filter((_, i) => i !== index));
    try {
      await deleteCloudinaryImage(toDelete.public_id);
    } catch (err) {
      console.error('刪除失敗', err);
    }
  };

  // 從邀請鏈結中提取機器人 ID
  const extractBotIdFromInviteLink = (inviteLink: string) => {
    const url = new URL(inviteLink);
    const params = new URLSearchParams(url.search);
    return params.get('client_id');
  };

  const onSubmitHandler = async (data: FormData) => {
    try {
      setLoading(true);

      await onSubmit(
        data,
        screenshotPreviews,
        bannerPreviews[0] ? bannerPreviews[0].url : undefined,
      );

      setLoading(false);
      if (mode === 'create') reset();

      const botId = extractBotIdFromInviteLink(data.botInvite);
      const avatarUrl = await getBotAvatarUrl(botId);
      if (mode !== 'edit') {
        await sendPendingWebhook(data, avatarUrl);
      }
      setSuccess(true);
      localStorage.removeItem('desc');
      localStorage.removeItem('longdesc');
      if (mode === 'edit') {
        toast.success('編輯成功');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#1e1f22] text-white flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5865f2]"></div>
        <p className="text-sm text-gray-400 animate-breath">加載中...</p>
      </div>
    );
  }

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
                          {...field}
                          rows={10}
                          placeholder="請輸入詳細描述 (支援Markdown)"
                          ref={el => {
                            field.ref(el);
                            textareaRef.current = el;
                          }}
                          onScroll={handleScroll}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div
                  ref={previewRef}
                  className="h-[250px] overflow-auto bg-[#1e1f22] border border-gray-700 rounded-md p-4 mt-4"
                >
                  <MarkdownRenderer
                    content={longDescription || '詳細描述預覽 (支援Markdown)'}
                  />
                </div>

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

                  <div className="space-y-10 mt-4">
                    <FormLabel htmlFor="bot-banner">機器人橫幅</FormLabel>
                    <div className="flex flex-col gap-3">
                      <ScreenshotGrid
                        screenshotPreviews={bannerPreviews.map(p => p.url)}
                        removeScreenshot={i =>
                          removeScreenshot(i, bannerPreviews, setBannerPreviews)
                        }
                      />
                      {bannerPreviews.length <= 1 && (
                        <div className="h-32 bg-[#36393f] rounded border border-dashed border-[#4f545c] flex items-center justify-center">
                          <Input
                            id="bot-banner"
                            type="file"
                            accept="image/*"
                            disabled={bannerPreviews.length === 1}
                            className="hidden"
                            onChange={e =>
                              handleScreenshotUpload(
                                e,
                                bannerPreviews,
                                setBannerPreviews,
                              )
                            }
                          />
                          <FormLabel
                            htmlFor="bot-banner"
                            className={`cursor-pointer flex flex-col items-center ${
                              bannerPreviews.length === 1
                                ? 'text-red-500 cursor-not-allowed'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {uploading ? (
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                                <span className="mt-2 text-sm">上傳中...</span>
                              </div>
                            ) : bannerPreviews.length === 1 ? (
                              <>
                                <X size={24} />
                                <span className="mt-2 text-sm">
                                  已達到上傳上限
                                </span>
                              </>
                            ) : (
                              <>
                                <Upload size={24} />
                                <span className="mt-2 text-sm">上傳橫幅</span>
                              </>
                            )}
                          </FormLabel>
                        </div>
                      )}
                      <p className="text-xs text-gray-400">
                        上傳您機器人的自訂橫幅 (如不設置將以機器人橫幅代替)
                      </p>
                    </div>
                  </div>

                  {/* 機器人截圖 */}
                  <div className="space-y-10 mt-4">
                    <FormLabel htmlFor="bot-screenshots">
                      機器人截圖（最多 5 張）
                    </FormLabel>
                    <div className="flex flex-col gap-3">
                      <ScreenshotGrid
                        screenshotPreviews={screenshotPreviews.map(p => p.url)}
                        removeScreenshot={i =>
                          removeScreenshot(
                            i,
                            screenshotPreviews,
                            setScreenshotPreviews,
                          )
                        }
                      />
                      {screenshotPreviews.length <= 5 && (
                        <div className="h-32 bg-[#36393f] rounded border border-dashed border-[#4f545c] flex items-center justify-center">
                          <Input
                            id="bot-screenshots"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e =>
                              handleScreenshotUpload(
                                e,
                                screenshotPreviews,
                                setScreenshotPreviews,
                              )
                            }
                          />
                          <FormLabel
                            htmlFor="bot-screenshots"
                            className={`cursor-pointer flex flex-col items-center ${
                              screenshotPreviews.length === 5
                                ? 'text-red-500 cursor-not-allowed'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {uploading ? (
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                                <span className="mt-2 text-sm">上傳中...</span>
                              </div>
                            ) : screenshotPreviews.length === 5 ? (
                              <>
                                <X size={24} />
                                <span className="mt-2 text-sm">
                                  已達到上傳上限
                                </span>
                              </>
                            ) : (
                              <>
                                <Upload size={24} />
                                <span className="mt-2 text-sm">上傳截圖</span>
                              </>
                            )}
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
                          ? '保存後，變更可能需要一段時間才會套用。'
                          : '提交後，我們將審核您的機器人。審核通常需要 1-2 個工作日。'}
                      </p>
                    </div>
                  </div>
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
                    className="relative discord text-white px-4 py-2 rounded disabled:opacity-50 flex items-center justify-center cursor-pointer"
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
          {mounted && success && (
            <div className="mt-4 text-green-500 text-sm border border-green-500 bg-green-100/10 rounded p-3">
              {mode === 'create'
                ? '✅ 機器人已成功提交，請等待審核人員審核，審核結果將會在網站的收件匣和官方群組的通知中出現。'
                : '✅ 機器人已成功保存！'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotForm;
