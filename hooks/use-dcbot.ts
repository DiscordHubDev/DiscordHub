"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { BotType } from "@/lib/types";

export function useBotData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  const updateBot = async (id: string, data: Partial<BotType>) => {
    reset();
    setLoading(true);
    const { error } = await supabase.from("Bot").update(data).eq("id", id);
    setLoading(false);
    setError(error?.message ?? null);
    setSuccess(!error);
  };

  const deleteBot = async (id: string) => {
    reset();
    setLoading(true);
    const { error } = await supabase.from("Bot").delete().eq("id", id);
    setLoading(false);
    setError(error?.message ?? null);
    setSuccess(!error);
  };

  const fetchBotById = async (id: string): Promise<BotType | null> => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Bot")
      .select("*")
      .eq("id", id)
      .single();
    setLoading(false);
    setError(error?.message ?? null);
    return data ?? null;
  };

  const fetchAllBots = async (): Promise<BotType[]> => {
    setLoading(true);
    const { data, error } = await supabase.from("Bot").select("*");
    setLoading(false);
    setError(error?.message ?? null);
    return data ?? [];
  };

  return {
    loading,
    error,
    success,
    updateBot,
    deleteBot,
    fetchBotById,
    fetchAllBots,
  };
}
