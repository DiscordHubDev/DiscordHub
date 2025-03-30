// components/MarkdownEditor.tsx
"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {/* 編輯區 */}
      <div className="flex flex-col">
        <label className="mb-2 font-medium text-sm">Markdown 編輯</label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          placeholder="輸入內容，支援 Markdown 語法（# 標題, *粗體*, - 列表...）"
        />
      </div>

      {/* 預覽區 */}
      <div className="flex flex-col border border-muted rounded-md p-4 overflow-auto bg-muted/30">
        <label className="mb-2 font-medium text-sm text-muted-foreground">
          預覽
        </label>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>
            {value || "這裡會顯示你輸入的 Markdown 預覽 👇"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
