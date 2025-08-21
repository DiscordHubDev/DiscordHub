'use client';

import { useState, useEffect } from 'react';
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
import { Vote } from '@/lib/actions/vote';
import { BotType, ServerType, UserType, VoteType } from '@/lib/prisma_type';
import { checkVoteCooldown } from '@/lib/actions/check-vote-cooldown';
import { useRouter } from 'next/navigation';
import { GetUserBySession } from '@/lib/actions/user';
import { getCsrfToken, useSession } from 'next-auth/react';
import { getServerByGuildId } from '@/lib/actions/servers';
import { getBot } from '@/lib/actions/bots';
import { useError } from '@/context/ErrorContext';
import { useCooldownController } from '@/hooks/use-cooldown';
import { sendWebhook } from '@/lib/webhook';

async function sendDataToWebServerOrDiscord(
  type: VoteType,
  user: UserType,
  server?: { id: string } | null,
  bot?: { id: string } | null,
) {
  const targetId = server?.id ?? bot?.id;
  if (!targetId) return null;

  const payload = {
    type,
    user: { id: user.id, username: user.username, avatar: user.avatar },
    targetId,
  };

  const csrfToken = await getCsrfToken();
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (csrfToken) headers.set('x-csrf-token', csrfToken);

  try {
    const res = await fetch('/api/proxy/vote_api', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Vote forwarding failed');
      return null;
    }
    return await res.json().catch(() => null);
  } catch (err) {
    console.error('Failed to send vote', err);
    return null;
  }
}

interface VoteButtonProps {
  id: string;
  type: 'server' | 'bot';
  initialVotes: number;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onVote: (votes: number) => void;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
}

export default function VoteButton({
  id,
  type,
  initialVotes,
  className,
  onVote,
  size = 'default',
  variant = 'default',
}: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { remaining, start } = useCooldownController();

  const router = useRouter();
  const { data: session } = useSession();
  const { showError } = useError();

  if (!session) {
    return;
  }

  useEffect(() => {
    if (remaining === 0) {
      setHasVoted(false);
    }
  }, [remaining]);

  useEffect(() => {
    const fetchCooldown = async () => {
      // 先檢查 localStorage 是否有緩存的冷卻時間
      const cacheKey = `vote_cooldown_${id}_${type}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const { endTime } = JSON.parse(cachedData);
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

        if (remaining > 0) {
          setHasVoted(true);
          start(remaining);
          return; // 不需要查詢資料庫
        } else {
          // 冷卻時間已過，清除緩存
          localStorage.removeItem(cacheKey);
        }
      }

      // 只有在沒有有效緩存時才查詢資料庫
      const result = await checkVoteCooldown(id, type as VoteType);

      if (result.cooldown > 0) {
        setHasVoted(true);
        start(result.cooldown);

        // 緩存結束時間
        const endTime = Date.now() + result.cooldown * 1000;
        localStorage.setItem(cacheKey, JSON.stringify({ endTime }));
      }
    };

    fetchCooldown();
  }, [id, type, start]);

  // 發送 Discord Webhook

  const handleVote = async () => {
    if (hasVoted) return;

    setIsVoting(true);

    const vote = await Vote(id, type.toUpperCase() as VoteType);
    const updatedVotes = vote.upvotes ?? 0;

    const user = await GetUserBySession(session);

    if (!user) {
      showError('請先登入！');
      setIsVoting(false);
      return;
    }

    let server: ServerType | undefined;
    let bot: BotType | undefined;

    if (type === 'server') {
      server = await getServerByGuildId(id);
    } else {
      const result = await getBot(id);
      bot = result ?? undefined;
    }

    // 處理錯誤情況
    if (!vote.success) {
      if (vote.error === 'COOLDOWN') {
        const remainingSec = vote.remaining
          ? Math.ceil(vote.remaining / 1000)
          : 0;

        setHasVoted(true);
        start(remainingSec); // ✅ 啟動倒數
      }

      if (vote.error === 'NOT_LOGGED_IN') {
        showError('請先登入！');
      }

      setIsVoting(false);
      return;
    }

    // ✅ 投票成功
    setVotes(updatedVotes);
    onVote(updatedVotes);
    setHasVoted(true);
    setShowDialog(true);
    setIsVoting(false);

    start(43200); // ✅ 啟動 12 小時倒數（43200 秒）

    await sendDataToWebServerOrDiscord(type, user, server, bot);

    router.refresh();

    await sendWebhook(type, user, id, server, bot);
  };

  // 格式化冷卻時間
  const formatCooldown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        onClick={hasVoted ? undefined : handleVote}
        disabled={hasVoted || isVoting}
        className={className}
        size={size}
        variant={variant}
      >
        {isVoting ? (
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            投票中...
          </div>
        ) : hasVoted ? (
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
          <div className="flex items-center text-gray-300">
            <ArrowUp size={16} className="mr-1.5" />
            <span>投票 ({(votes ?? 0).toLocaleString()})</span>
          </div>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#2b2d31] border-[#1e1f22] text-white">
          <DialogHeader>
            <DialogTitle>投票成功！</DialogTitle>
            <DialogDescription className="text-gray-400">
              感謝您的投票，您已成功為這個
              {type === 'server' ? '伺服器' : '機器人'}投票。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-between text-sm mb-2">
              <span>投票冷卻時間</span>
              <span>{formatCooldown(remaining)}</span>
            </div>
            <Progress
              value={((43200 - remaining) / 43200) * 100}
              className="h-2 bg-[#36393f]"
            />
            <p className="text-gray-400 text-sm mt-2">
              您需要等待 12 小時後才能再次投票。
            </p>
          </div>

          <div className="bg-[#36393f] p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUp size={18} className="text-[#5865f2] mr-2" />
                <span className="font-medium">當前票數</span>
              </div>
              <span className="font-bold text-lg">
                {votes.toLocaleString()}
              </span>
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
