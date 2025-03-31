"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";
import TagInput from "@/components/TagInput";
import MarkdownEditorWithPreview from "@/components/ui/website/profile/MarkdownEditorWithPreview";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addBotSchema } from "@/schemas/add-bot-schema";

type FormData = z.infer<typeof addBotSchema>;

const AddBotDialog = () => {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(addBotSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      tags: [],
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("✅ 新增機器人資料：", data);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>新增機器人</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新增機器人</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 機器人名稱 */}
          <div className="space-y-2">
            <Label htmlFor="name">機器人名稱</Label>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Input id="name" placeholder="輸入機器人名稱" {...field} />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Markdown 簡介（詳細說明） */}
          <div className="space-y-2">
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <MarkdownEditorWithPreview
                    value={field.value}
                    onChange={field.onChange}
                    label="詳細說明"
                    placeholder="請輸入完整內容，支援 Markdown 語法"
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* 分類 / 標籤 */}
          <div className="space-y-2">
            <Label htmlFor="tags">分類 / 標籤</Label>
            <Controller
              name="tags"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <TagInput
                    tags={field.value}
                    onChange={field.onChange}
                    placeholder="輸入分類後按 Enter（如：音樂、AI、管理）"
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit">儲存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBotDialog;
