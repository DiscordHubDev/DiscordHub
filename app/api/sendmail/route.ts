import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import type { EmailPriority } from "@/lib/types"; // e.g. "info" | "success" | ...

export async function POST(req: Request) {
  const body = await req.json();

  const {
    subject,
    teaser,
    priority = "info",
    name = "系統通知",
    userId = null,
  }: {
    subject: string;
    teaser: string;
    priority?: EmailPriority;
    name?: string;
    userId?: number | null;
  } = body;

  const { error } = await supabase.from("Notification").insert([
    {
      id: createId(),
      name,
      createdAt: new Date().toISOString(),
      subject,
      teaser,
      userId,
      priority: priority,
      isSystem: userId === null, // null = 系統廣播
      read: false,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
