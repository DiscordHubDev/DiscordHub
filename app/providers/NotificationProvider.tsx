'use client';

import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

export function NotificationListener({
  onNotify,
}: {
  onNotify: (data: any) => void;
}) {
  const { data: session } = useSession();

  if (session?.error === 'RefreshAccessTokenError') {
    return;
  }

  const userId = session?.discordProfile?.id;

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-all`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
        },
        payload => {
          const data = payload.new;
          const isForMe = data.user_id === userId;
          const isBroadcast = data.user_id === null;

          if (isForMe || isBroadcast) {
            onNotify(data);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNotify]);

  return null;
}
