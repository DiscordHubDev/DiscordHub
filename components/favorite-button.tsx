'use client';

import { toggleFavorite } from '@/lib/actions/favorite';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function FavoriteButton({
  id,
  target,
  isFavorited: initialFavorited,
}: {
  id: string;
  target: 'server' | 'bot';
  isFavorited: boolean;
}) {
  const { data: session } = useSession();
  const userId = session?.discordProfile?.id;

  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!userId) {
      toast.warning('請先登入才能收藏！');
      return;
    }

    setFavorited(prev => !prev);
    setLoading(true);

    try {
      await toggleFavorite({ userId, target, id });
    } catch (err) {
      setFavorited(prev => !prev);
      toast.error('收藏操作失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={favorited ? '取消收藏' : '加入收藏'}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 transform hover:scale-105
        ${favorited ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-500 hover:bg-indigo-600'}
        text-white disabled:cursor-not-allowed `}
    >
      <Heart
        size={18}
        className={`transition-colors duration-150 ${
          favorited ? 'fill-white stroke-white' : 'stroke-white'
        }`}
      />
      {favorited ? '已收藏' : '收藏'}
    </button>
  );
}
