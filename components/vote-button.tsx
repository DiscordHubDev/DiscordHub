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
import { VoteType } from '@/lib/prisma_type';
import { checkVoteCooldown } from '@/lib/actions/check-vote-cooldown';
import { useRouter } from 'next/navigation';

interface VoteButtonProps {
    id: string;
    type: 'server' | 'bot';
    initialVotes: number;
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

export default function VoteButton({
    id,
    type,
    initialVotes,
    className,
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

    useEffect(() => {
        const fetchCooldown = async () => {
            const result = await checkVoteCooldown(id, type as VoteType);
            if (result.cooldown > 0) {
                setHasVoted(true);
                setCooldown(result.cooldown);

                const interval = setInterval(() => {
                    setCooldown((prev) => {
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

    // 處理投票
    const handleVote = async () => {
        if (hasVoted) return;

        setIsVoting(true);

        const vote = await Vote(id, type.toUpperCase() as VoteType);

        if (!vote.success) {
            if (vote.error === 'COOLDOWN') {
                const remainingSec = vote.remaining
                    ? Math.ceil(vote.remaining / 1000)
                    : 0;

                setCooldown(remainingSec);
                setHasVoted(true);
            }
            setIsVoting(false);
            return;
        }

        setVotes(vote.upvotes ?? 0);
        setCooldown(43200);
        setHasVoted(true);
        setShowDialog(true);
        setIsVoting(false);

        router.refresh();

        // 啟動倒數
        const interval = setInterval(() => {
            setCooldown((prev) => {
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
                            {formatCooldown(cooldown)}
                        </span>
                        <span className="sm:hidden">
                            {Math.floor(cooldown / 3600)}小時
                        </span>
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
                                <ArrowUp
                                    size={18}
                                    className="text-[#5865f2] mr-2"
                                />
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
