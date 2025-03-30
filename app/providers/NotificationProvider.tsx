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

    const personal = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotify(payload.new);
        }
      )
      .subscribe();

    const global = supabase
      .channel("global-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
          filter: "user_id=is.null",
        },
        (payload) => {
          onNotify(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(personal);
      supabase.removeChannel(global);
    };
  }, [userId, onNotify]);

  return null;
}
