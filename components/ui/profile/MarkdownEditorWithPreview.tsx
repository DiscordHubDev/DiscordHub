"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
};

const MarkdownEditorWithPreview = ({
  label = "Markdown 內容",
  placeholder = "請輸入內容，支援 Markdown 語法",
  value,
  onChange,
}: Props) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* 編輯區 */}
      <Textarea
        rows={16}
        className="prose max-w-none overflow-auto max-h-[150px] whitespace-pre-wrap break-words"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* 預覽區 */}
      <div className="flex flex-col border border-muted rounded-md p-4 overflow-auto bg-muted/30 mt-4">
        <label className="mb-2 font-medium text-sm text-muted-foreground">
          預覽
        </label>
        <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto max-h-[160px] break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-600 pl-4 text-muted-foreground">
                  {children}
                </blockquote>
              ),
            }}
          >
            {value}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditorWithPreview;
