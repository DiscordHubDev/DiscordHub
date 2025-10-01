'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { JsonValue } from '@prisma/client/runtime/library';

export type Developer = {
  id: string;
  banner: string | null;
  username: string;
  avatar: string;
  banner_color: string | null;
  bio: string | null;
  joinedAt: Date;
  social: JsonValue;
};

type RejectBotDialogProps = {
  botId: string;
  userIds: Developer[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
  botName?: string;
};

const COMMON_REJECTION_REASONS = [
  '機器人功能與描述不符',
  '包含不適當或違規內容',
  '邀請連結無效',
] as const;

const MIN_CHARS = 4;
const MAX_CHARS = 500;

export default function RejectBotDialog({
  botId,
  userIds,
  isOpen,
  onClose,
  onConfirm,
  botName,
}: RejectBotDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 關閉對話框時重置狀態
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setReason('');
        setIsSubmitting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const charCount = reason.trim().length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const isOverLimit = charCount > MAX_CHARS;

  const handleConfirm = useCallback(async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reject-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds, // ✅ 傳整個列表
          botName,
          reason: reason.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send rejection DMs');
      }

      await onConfirm(botId, reason.trim());
    } catch (error) {
      console.error('Failed to reject bot:', error);
      setIsSubmitting(false);
    }
  }, [botId, userIds, reason, isValid, isSubmitting, onConfirm, botName]);
  // 處理關閉
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  // 快速選擇常見原因
  const handleQuickSelect = useCallback((selectedReason: string) => {
    setReason(prev => {
      // 如果已經包含該原因，則不重複添加
      if (prev.includes(selectedReason)) return prev;
      // 如果已有內容，添加分號分隔
      return prev ? `${prev}；${selectedReason}` : selectedReason;
    });
  }, []);

  // 鍵盤快捷鍵支持
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl/Cmd + Enter 提交
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isValid) {
        e.preventDefault();
        handleConfirm();
      }
      // Escape 關閉
      if (e.key === 'Escape' && !isSubmitting) {
        handleClose();
      }
    },
    [isValid, isSubmitting, handleConfirm, handleClose],
  );

  // 字數顯示樣式
  const charCountColor = useMemo(() => {
    if (isOverLimit) return 'text-red-500';
    if (charCount < MIN_CHARS) return 'text-gray-400';
    return 'text-green-500';
  }, [charCount, isOverLimit]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <DialogTitle className="text-lg sm:text-xl">
                拒絕機器人申請
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm text-gray-500 mt-2">
            {botName ? (
              <>
                您即將拒絕{' '}
                <span className="font-semibold text-gray-700">{botName}</span>{' '}
                的申請，請說明拒絕原因以幫助開發者改進。
              </>
            ) : (
              '請詳細說明機器人未通過審核的原因，以幫助開發者改進。'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 常見原因快速選擇 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              常見原因（點擊快速添加）
            </Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_REJECTION_REASONS.map(commonReason => (
                <Button
                  key={commonReason}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5 hover:bg-gray-100"
                  onClick={() => handleQuickSelect(commonReason)}
                  disabled={isSubmitting}
                >
                  {commonReason}
                </Button>
              ))}
            </div>
          </div>

          {/* 自定義原因輸入 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="reason" className="text-sm font-medium">
                拒絕原因 <span className="text-red-500">*</span>
              </Label>
              <span className={`text-xs ${charCountColor} transition-colors`}>
                {charCount} / {MAX_CHARS}
                {charCount < MIN_CHARS && (
                  <span className="ml-1">(至少 {MIN_CHARS} 字)</span>
                )}
              </span>
            </div>
            <Textarea
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="請詳細說明拒絕原因，例如：功能描述不清楚、截圖品質不佳、缺少必要說明等..."
              className={`min-h-[150px] resize-none transition-colors ${
                isOverLimit ? 'border-red-500 focus-visible:ring-red-500' : ''
              }`}
              disabled={isSubmitting}
              maxLength={MAX_CHARS + 50}
            />

            {/* 驗證提示 */}
            {charCount > 0 && charCount < MIN_CHARS && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                還需要至少 {MIN_CHARS - charCount} 個字
              </p>
            )}
            {isOverLimit && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                超出 {charCount - MAX_CHARS} 個字
              </p>
            )}
          </div>

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-800">
              💡 <span className="font-medium">提示：</span>
              清晰的拒絕原因有助於開發者了解問題並改進機器人。您也可以使用
              Ctrl/Cmd + Enter 快速提交。
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial"
          >
            <X className="h-4 w-4 mr-1" />
            取消
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting}
            className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                處理中...
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-1" />
                確認拒絕
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
