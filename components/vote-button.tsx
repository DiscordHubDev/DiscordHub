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
import {
  BotWithFavorites,
  ServerType,
  UserType,
  VoteType,
} from '@/lib/prisma_type';
import { checkVoteCooldown } from '@/lib/actions/check-vote-cooldown';
import { useRouter } from 'next/navigation';
import { GetUserBySession } from '@/lib/actions/user';
import { signIn, useSession } from 'next-auth/react';
import { getServerByGuildId } from '@/lib/actions/servers';
import { toast } from 'react-toastify';
import { getBot } from '@/lib/actions/bots';
import { getRandomEmbedColor } from '@/lib/utils';

async function sendDataToWebServerOrDiscord(
  type: string,
  user: UserType,
  server?: ServerType,
  bot?: BotWithFavorites,
) {
  const target = server ?? bot;

  if (!target?.VoteNotificationURL) return;

  const url = target.VoteNotificationURL;
  const isDiscordWebhook = url.startsWith('https://discord.com/api/webhooks/');

  const payload = isDiscordWebhook
    ? {
        content: `<@${user.id}>`,
        embeds: [
          {
            author: {
              name: user.username,
              icon_url: user.avatar,
            },
            title: '❤️ | 感謝投票!',
            url: 'https://dchubs.org',
            description: `感謝您的支持與投票！您的每一票都是讓${bot ? '機器人' : '伺服器'}變得更好的動力。\n\n請記得每 12 小時可以再次投票一次，讓更多人發現我們的${bot ? '機器人' : '伺服器'}吧！✨`,
            color: getRandomEmbedColor(),
            footer: {
              text: 'Powered by DawnGS Vote System',
              icon_url:
                'https://example.com/logo.pnghttps://images-ext-1.discordapp.net/external/UPq4fK1TpfNlL5xKNkZwqO02wPJoX-yd9IKkk5UnyP8/%3Fsize%3D512%26format%3Dwebp/https/cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?format=webp',
            },
          },
        ],
      }
    : {
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar,
        votedAt: new Date().toISOString(),
        itemId: target.id,
        itemType: type,
        itemName: target.name,
      };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!isDiscordWebhook && target.secret) {
    headers['x-api-secret'] = target.secret;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return null;
  }

  return res.status === 204 ? null : await res.json().catch(() => null);
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
  const [cooldown, setCooldown] = useState(0);
  const [cooldownInterval, setCooldownInterval] =
    useState<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const { data: session } = useSession();

  if (!session || session?.error === 'RefreshAccessTokenError') {
    return;
  }

  useEffect(() => {
    const fetchCooldown = async () => {
      const result = await checkVoteCooldown(id, type as VoteType);
      if (result.cooldown > 0) {
        setHasVoted(true);
        setCooldown(result.cooldown);

        const interval = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setHasVoted(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setCooldownInterval(interval);
      }
    };

    fetchCooldown();

    return () => {
      if (cooldownInterval) {
        clearInterval(cooldownInterval);
      }
    };
  }, [id, type]);

  // 發送 Discord Webhook
  const sendWebhook = async (
    user: UserType,
    server?: ServerType,
    bot?: BotWithFavorites,
  ) => {
    const target = (server ?? bot)!;
    const webhookUrl =
      'https://discord.com/api/webhooks/1362078586860867715/e101LoJweqQpUb425i-xDhT6ZUv42SNOr1OnoOQihEBZ_muBShUO10RZlAvOWh3QR7Fq';
    const username = user?.username;
    const userid = user?.id;
    const voteItem = type === 'server' ? '伺服器' : '機器人';
    const embed = {
      title: `<:pixel_symbol_exclamation_invert:1361299311131885600> | 投票系統`,
      description: `➤用戶：**${username}**\n➤用戶ID：**${userid}**\n> ➤對**${voteItem}**：**${target.name}** 進行了投票\n> ➤${voteItem}ID：**${id}**`,
      color: 0x4285f4,
    };

    const data = {
      embeds: [embed],
      username: 'DcHubs投票通知',
      avatar_url:
        'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
    };
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Webhook 發送失敗:', response.statusText);
      } else {
      }
    } catch (error) {
      console.error('發送 Webhook 時出錯:', error);
    }
  };

  // 處理投票
  const handleVote = async () => {
    if (hasVoted) return;

    setIsVoting(true);

    const vote = await Vote(id, type.toUpperCase() as VoteType);
    const updatedVotes = vote.upvotes ?? 0;

    const user = await GetUserBySession(session);

    let server: ServerType | undefined;
    let bot: BotWithFavorites | undefined;

    if (type === 'server') {
      server = await getServerByGuildId(id);
    } else {
      const result = await getBot(id);
      bot = result ?? undefined;
    }

    if (!user) throw new Error('User not found.');

    if (!vote.success) {
      if (vote.error === 'COOLDOWN') {
        const remainingSec = vote.remaining
          ? Math.ceil(vote.remaining / 1000)
          : 0;

        setCooldown(remainingSec);
        setHasVoted(true);
      }

      if (vote.error === 'NOT_LOGGED_IN') {
        toast.error('請先登入！');
      }

      setIsVoting(false);
      return;
    }

    setVotes(updatedVotes);
    onVote(updatedVotes);
    setCooldown(43200);
    setHasVoted(true);
    setShowDialog(true);
    setIsVoting(false);

    if (!user) return;

    await sendDataToWebServerOrDiscord(type, user, server, bot);

    router.refresh();

    await sendWebhook(user, server, bot);

    // 啟動倒數
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setHasVoted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setCooldownInterval(interval);
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
            <span className="hidden sm:inline">{formatCooldown(cooldown)}</span>
            <span className="sm:hidden">{Math.floor(cooldown / 3600)}小時</span>
          </div>
        ) : (
          <div className="flex items-center">
            <ArrowUp size={16} className="mr-1.5" />
            <span>投票 ({votes.toLocaleString()})</span>
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
              <span>{formatCooldown(cooldown)}</span>
            </div>
            <Progress
              value={((43200 - cooldown) / 43200) * 100}
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
