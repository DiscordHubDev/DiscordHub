"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";

export function NotificationListener({
  onNotify,
}: {
  onNotify: (data: any) => void;
}) {
  const { data: session } = useSession();
  const userId = session?.discordProfile?.id;

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-all`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
        },
        (payload) => {
          const data = payload.new;
          const isForMe = data.user_id === userId;
          const isBroadcast = data.user_id === null;

          if (isForMe || isBroadcast) {
            console.log("📩 收到通知：", data);
            onNotify(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNotify]);

  return null;
}
