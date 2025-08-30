'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { VoteType } from '@/lib/prisma_type';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useError } from '@/context/ErrorContext';
import { Pin } from '@/lib/actions/pin';
import { checkPinCooldown } from '@/lib/actions/check-pin-cooldown';
import { useCooldownController } from '@/hooks/use-cooldown';
import { cn } from '@/lib/utils';

// async function sendDataToWebServerOrDiscord(
//   type: string,
//   user: UserType,
//   server?: ServerType,
//   bot?: BotWithFavorites,
// ) {
//   const target = server ?? bot;

//   if (!target?.VoteNotificationURL) return;

//   const url = target.VoteNotificationURL;
//   const isDiscordWebhook = url.startsWith('https://discord.com/api/webhooks/');

//   const payload = isDiscordWebhook
//     ? {
//         content: `<@${user.id}>`,
//         embeds: [
//           {
//             author: {
//               name: user.username,
//               icon_url: user.avatar,
//             },
//             title: '❤️ | 感謝投票!',
//             url: 'https://dchubs.org',
//             description: `感謝您的支持與投票！您的每一票都是讓${bot ? '機器人' : '伺服器'}變得更好的動力。\n\n請記得每 12 小時可以再回來 [DcHubs](https://dchubs.org/${bot ? 'bots' : 'servers'}/${target.id}) 投票一次，讓更多人發現我們的${bot ? '機器人' : '伺服器'}吧！✨`,
//             color: getRandomEmbedColor(),
//             footer: {
//               text: 'Powered by DcHubs Vote System',
//               icon_url:
//                 'https://images-ext-1.discordapp.net/external/UPq4fK1TpfNlL5xKNkZwqO02wPJoX-yd9IKkk5UnyP8/%3Fsize%3D512%26format%3Dwebp/https/cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?format=webp',
//             },
//           },
//         ],
//       }
//     : {
//         userId: user.id,
//         username: user.username,
//         userAvatar: user.avatar,
//         votedAt: new Date().toISOString(),
//         itemId: target.id,
//         itemType: type,
//         itemName: target.name,
//       };

//   const headers: Record<string, string> = {
//     'Content-Type': 'application/json',
//   };

//   if (!isDiscordWebhook && target.secret) {
//     headers['x-api-secret'] = target.secret;
//   }

//   const res = await fetch(url, {
//     method: 'POST',
//     headers,
//     body: JSON.stringify(payload),
//   });

//   if (!res.ok) {
//     return null;
//   }

//   return res.status === 204 ? null : await res.json().catch(() => null);
// }

interface PinButtonProps {
  id: string;
  type: 'server' | 'bot';
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
}

export default function PinButton({
  id,
  type,
  className,
  size = 'default',
  variant = 'default',
}: PinButtonProps) {
  const [hasPinned, setHasPinned] = useState(false);
  const [isPining, setIsPining] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { remaining, start } = useCooldownController();

  const router = useRouter();
  const { data: session } = useSession();
  const { showError } = useError();

  if (!session) {
    return;
  }

  useEffect(() => {
    const fetchCooldown = async () => {
      // 先檢查 localStorage 是否有緩存的冷卻時間
      const cacheKey = `pin_cooldown_${id}_${type}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const { endTime } = JSON.parse(cachedData);
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

        if (remaining > 0) {
          setHasPinned(true);
          start(remaining);
          console.log('Cached cooldown seconds:', remaining);
          return; // 不需要查詢資料庫
        } else {
          // 冷卻時間已過，清除緩存
          localStorage.removeItem(cacheKey);
        }
      }

      // 只有在沒有有效緩存時才查詢資料庫
      const result = await checkPinCooldown(id, type as VoteType);

      if (result.cooldown > 0) {
        setHasPinned(true);
        start(result.cooldown);
        console.log('Initial cooldown seconds:', result.cooldown);

        // 緩存結束時間
        const endTime = Date.now() + result.cooldown * 1000;
        localStorage.setItem(cacheKey, JSON.stringify({ endTime }));
      }
    };

    fetchCooldown();
  }, [id, type, start]);

  // // 發送 Discord Webhook
  // const sendWebhook = async (
  //   user: UserType,
  //   server?: ServerType,
  //   bot?: BotWithFavorites,
  // ) => {
  //   const target = (server ?? bot)!;
  //   const webhookUrl =
  //     'https://discord.com/api/webhooks/1362078586860867715/e101LoJweqQpUb425i-xDhT6ZUv42SNOr1OnoOQihEBZ_muBShUO10RZlAvOWh3QR7Fq';
  //   const username = user?.username;
  //   const userid = user?.id;
  //   const voteItem = type === 'server' ? '伺服器' : '機器人';
  //   const embed = {
  //     title: `<:pixel_symbol_exclamation_invert:1361299311131885600> | 投票系統`,
  //     description: `➤用戶：**${username}**\n➤用戶ID：**${userid}**\n> ➤對**${voteItem}**：**${target.name}** 進行了投票\n> ➤${voteItem}ID：**${id}**`,
  //     color: 0x4285f4,
  //   };

  //   const data = {
  //     embeds: [embed],
  //     username: 'DcHubs投票通知',
  //     avatar_url:
  //       'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
  //   };
  //   try {
  //     const response = await fetch(webhookUrl, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     if (!response.ok) {
  //       console.error('Webhook 發送失敗:', response.statusText);
  //     } else {
  //     }
  //   } catch (error) {
  //     console.error('發送 Webhook 時出錯:', error);
  //   }
  // };

  // 處理投票
  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (hasPinned) return;

    setIsPining(true);

    const pin = await Pin(id, type.toUpperCase() as VoteType);

    if (!pin.success) {
      if (pin.error === 'COOLDOWN') {
        const remainingSec = pin.remaining
          ? Math.ceil(pin.remaining / 1000)
          : 0;

        console.log('remaining', remainingSec);

        setHasPinned(true);
        start(remainingSec); // ✅ 啟動倒數
      }

      if (pin.error === 'NOT_LOGGED_IN') {
        showError('請先登入！');
      }

      setIsPining(false);
      return;
    }

    // ✅ Pin 成功，啟動 12 小時倒數
    start(43200);
    setHasPinned(true);
    setShowDialog(true);
    setIsPining(false);

    router.refresh();
  };

  // 格式化冷卻時間
  const formatCooldown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* <Button onClick={sendWebhook} className="mb-2" variant="secondary">
        測試
      </Button> */}
      {/* <Button onClick={sendWebhook} className="mb-2" variant="secondary">
        測試
      </Button> */}
      <Button
        onClick={hasPinned ? undefined : handlePin}
        className={cn(
          className,
          hasPinned || isPining
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer',
        )}
        size={size}
        variant={variant}
      >
        {isPining ? (
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            置頂中...
          </div>
        ) : hasPinned ? (
          <div className="flex items-center">
            <Clock size={16} className="mr-1.5" />
            <span className="hidden sm:inline">
              {formatCooldown?.(remaining ?? 0)}
            </span>
            <span className="sm:hidden">
              {Math.floor((remaining ?? 0) / 3600)}小時
            </span>
          </div>
        ) : (
          <div className="flex items-center">
            <ArrowUp size={16} className="mr-1.5" />
            <span>置頂</span>
          </div>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#2b2d31] border-[#1e1f22] text-white">
          <DialogHeader>
            <DialogTitle>置頂成功！</DialogTitle>
            <DialogDescription className="text-gray-400">
              您已成功為這個
              {type === 'server' ? '伺服器' : '機器人'}置頂。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-between text-sm mb-2">
              <span>置頂冷卻時間</span>
              <span>{formatCooldown(remaining)}</span>
            </div>
            <Progress
              value={((43200 - remaining) / 43200) * 100}
              className="h-2 bg-[#36393f]"
            />
            <p className="text-gray-400 text-sm mt-2">
              您需要等待 12 小時後才能再次置頂。
            </p>
          </div>

          <div className="bg-[#36393f] p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUp size={18} className="text-[#5865f2] mr-2" />
                <span className="font-medium">置頂</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowDialog(false)}
              className="bg-[#5865f2] hover:bg-[#4752c4]"
            >
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
