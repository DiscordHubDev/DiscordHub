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
  // 必需的安全參數
  itemName: string; // 項目名稱
  ownerId?: string; // 擁有者ID
  devs?: string[]; // 可選的開發者ID列表
}

export default function PinButton({
  id,
  type,
  className,
  size = 'default',
  variant = 'default',
  itemName,
  ownerId,
  devs,
}: PinButtonProps) {
  const [hasPinned, setHasPinned] = useState(false);
  const [isPining, setIsPining] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { remaining, start } = useCooldownController();

  const router = useRouter();
  const { data: session } = useSession();
  const { showError } = useError();

  // 如果未登入，不顯示按鈕
  if (!session) {
    return null;
  }

  // 只有擁有者才能看到置頂按鈕
  const userId = session?.discordProfile?.id ?? '';

  console.log(`${type}`, userId, ownerId, devs);

  if (
    (type === 'bot' && !devs?.includes(userId)) ||
    (type !== 'bot' && userId !== ownerId)
  ) {
    return null;
  }

  // 生成安全令牌
  const generateSecurityToken = (
    id: string,
    type: string,
    userId: string,
  ): string => {
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 5));
    const data = `${id}-${type.toLowerCase()}-${userId}-${timestamp}`;
    return btoa(data);
  };

  useEffect(() => {
    const fetchCooldown = async () => {
      // 先檢查 localStorage 緩存
      const cacheKey = `pin_cooldown_${id}_${type}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const { endTime } = JSON.parse(cachedData);
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

        if (remaining > 0) {
          setHasPinned(true);
          start(remaining);
          console.log('Cached cooldown seconds:', remaining);
          return;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }

      // 查詢數據庫
      const result = await checkPinCooldown(id, type as VoteType);

      if (result.cooldown > 0) {
        setHasPinned(true);
        start(result.cooldown);
        console.log('Initial cooldown seconds:', result.cooldown);

        const endTime = Date.now() + result.cooldown * 1000;
        localStorage.setItem(cacheKey, JSON.stringify({ endTime }));
      }
    };

    fetchCooldown();
  }, [id, type, start]);

  // 處理置頂操作
  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (hasPinned || !session?.discordProfile?.id) return;

    // 前端安全驗證
    if (!id || !type || !itemName) {
      showError('缺少必要參數！');
      return;
    }

    // 驗證 ID 格式
    if (!/^\d{17,19}$/.test(id)) {
      showError('無效的項目 ID！');
      return;
    }

    // 確認是擁有者
    if (
      session?.discordProfile?.id !== ownerId &&
      type === 'bot' &&
      devs &&
      devs.includes(session?.discordProfile?.id ?? '')
    ) {
      showError('您只能為自己的項目置頂！');
      return;
    }

    setIsPining(true);

    try {
      // 生成安全參數
      const securityToken = generateSecurityToken(
        id,
        type,
        session?.discordProfile?.id,
      );
      const timestamp = Date.now();

      // 調用 Pin 函數
      const pin = await Pin(id, type.toUpperCase() as VoteType, {
        securityToken,
        itemName,
        timestamp,
      });

      if (!pin.success) {
        let errorMessage = '置頂失敗！';

        switch (pin.error) {
          case 'COOLDOWN':
            const remainingSec = pin.remaining
              ? Math.ceil(pin.remaining / 1000)
              : 0;
            setHasPinned(true);
            start(remainingSec);
            errorMessage = `置頂冷卻中，還需等待 ${Math.floor(
              remainingSec / 3600,
            )} 小時`;
            break;
          case 'NOT_LOGGED_IN':
            errorMessage = '請先登入！';
            break;
          case 'NOT_OWNER':
            errorMessage = `您只能為自己的${
              type === 'server' ? '伺服器' : '機器人'
            }置頂！`;
            break;
          case 'INVALID_ID_FORMAT':
            errorMessage = '無效的項目 ID 格式！';
            break;
          case 'SECURITY_VIOLATION':
            errorMessage = '安全驗證失敗，請重新整理頁面！';
            break;
          case 'ITEM_NAME_MISMATCH':
            errorMessage = '不匹配，請重新整理頁面！';
            break;
          case 'REQUEST_EXPIRED':
            errorMessage = '請求已過期，請重新操作！';
            break;
          case 'NOT_FOUND':
            errorMessage = '找不到該項目！';
            break;
          case 'SERVER_ERROR':
            errorMessage = '伺服器出現重大錯誤，請聯絡網站管理員！';
            break;
          default:
            errorMessage = `置頂失敗：${pin.error}`;
        }

        showError(errorMessage);
        setIsPining(false);
        return;
      }

      // 置頂成功
      start(43200); // 12小時冷卻
      setHasPinned(true);
      setShowDialog(true);

      // 緩存冷卻時間
      const cacheKey = `pin_cooldown_${id}_${type}`;
      const endTime = Date.now() + 43200 * 1000;
      localStorage.setItem(cacheKey, JSON.stringify({ endTime }));

      router.refresh();
    } catch (error) {
      console.error('Pin operation error:', error);
      showError('置頂操作發生錯誤，請稍後再試！');
    } finally {
      setIsPining(false);
    }
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
      <Button
        onClick={hasPinned ? undefined : handlePin}
        disabled={hasPinned || isPining}
        className={cn(
          className,
          hasPinned || isPining
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer',
        )}
        size={size}
        variant={variant}
        title={
          hasPinned
            ? `冷卻時間：${formatCooldown(remaining ?? 0)}`
            : '置頂您的項目'
        }
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
              您已成功為您的{type === 'server' ? '伺服器' : '機器人'}「
              {itemName}」置頂。
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
              您需要等待 12 小時後才能再次置頂此項目。
            </p>
          </div>

          <div className="bg-[#36393f] p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUp size={18} className="text-[#5865f2] mr-2" />
                <span className="font-medium">置頂 - {itemName}</span>
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
