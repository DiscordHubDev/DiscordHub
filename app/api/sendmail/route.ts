import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    title,
    message,
    level = "info",
    type = "system",
    userId = null,
  } = body;

  const { error } = await supabase.from("Notification").insert([
    {
      id: createId(),
      title,
      message,
      level,
      type,
      userId,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
