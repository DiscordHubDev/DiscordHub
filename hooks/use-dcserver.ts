"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ServerType } from "@/lib/types";

export function useServerData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  const insertServer = async (data: ServerType) => {
    reset();
    setLoading(true);
    const { error } = await supabase.from("Server").insert(data);
    setLoading(false);
    setError(error?.message ?? null);
    setSuccess(!error);
  };

  const updateServer = async (id: string, data: Partial<ServerType>) => {
    reset();
    setLoading(true);
    const { error } = await supabase.from("Server").update(data).eq("id", id);
    setLoading(false);
    setError(error?.message ?? null);
    setSuccess(!error);
  };

  const deleteServer = async (id: string) => {
    reset();
    setLoading(true);
    const { error } = await supabase.from("Server").delete().eq("id", id);
    setLoading(false);
    setError(error?.message ?? null);
    setSuccess(!error);
  };

  const fetchServerById = async (id: string): Promise<ServerType | null> => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Server")
      .select("*")
      .eq("id", id)
      .single();
    setLoading(false);
    setError(error?.message ?? null);
    return data ?? null;
  };

  const fetchAllServers = async (): Promise<ServerType[]> => {
    setLoading(true);
    const { data, error } = await supabase.from("Server").select("*");
    setLoading(false);
    setError(error?.message ?? null);
    return data ?? [];
  };

  return {
    loading,
    error,
    success,
    insertServer,
    updateServer,
    deleteServer,
    fetchServerById,
    fetchAllServers,
  };
}
