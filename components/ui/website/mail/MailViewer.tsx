"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Mail } from "./MailItem";
import { cn } from "@/lib/utils";

export function MailViewer({
  open,
  onOpenChange,
  mail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mail: Mail | null;
}) {
  if (!mail) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-lg shadow-xl border border-border bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {mail.subject}
          </DialogTitle>

          <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
            <DialogDescription className="text-sm text-muted-foreground">
              📩 From: <span className="font-medium">{mail.name}</span> ·{" "}
              {mail.date}
            </DialogDescription>

            <div className="flex items-center gap-1 text-[10px] font-medium">
              {!mail.read && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                  未讀
                </span>
              )}
              {mail.isSystem && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  系統通知
                </span>
              )}
              <span
                className={cn("px-2 py-0.5 rounded-full", {
                  "bg-green-100 text-green-700": mail.level === "SUCCESS",
                  "bg-blue-100 text-blue-700": mail.level === "INFO",
                  "bg-yellow-100 text-yellow-800": mail.level === "WARNING",
                  "bg-red-100 text-red-700": mail.level === "DANGER",
                })}
              >
                {mail.level}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* 內容區塊 */}
        <div className=" whitespace-pre-line text-sm leading-relaxed text-foreground">
          {mail.teaser}
        </div>
      </DialogContent>
    </Dialog>
  );
}
