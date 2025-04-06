"use client";

import { useState, useRef } from "react";
import { UploadedFile } from "@/lib/types";
import { toast } from "react-toastify";
import {
  deleteCloudinaryImage,
  getCloudinarySignature,
} from "@/lib/actions/image";
import ScreenshotGrid from "./form/bot-form/ScreenshotGrid";
import { Upload } from "lucide-react";

type Props = {
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  max?: number;
};

export function AttachmentUploader({ value, onChange, max = 5 }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null); // ✅ ref
  const remaining = max - value.length;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, remaining);
    if (fileArray.length === 0) return;

    setUploading(true);

    try {
      const sig = await getCloudinarySignature();

      for (const file of fileArray) {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const resourceType = isImage ? "image" : isVideo ? "video" : "raw";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sig.apiKey);
        formData.append("timestamp", sig.timestamp.toString());
        formData.append("signature", sig.signature);
        formData.append("upload_preset", sig.uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "上傳失敗");

        const uploaded: UploadedFile = {
          url: data.secure_url,
          public_id: data.public_id,
          format: data.format,
          type: resourceType,
          original_filename: data.original_filename,
        };

        onChange([...value, uploaded]);
      }
    } catch (err: any) {
      toast.error("上傳失敗：" + err.message);
    }

    setUploading(false);
  };

  const handleRemove = async (index: number) => {
    const toDelete = value[index];
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);

    try {
      await deleteCloudinaryImage(toDelete.public_id);
    } catch (err) {
      console.error("刪除失敗", err);
    }
  };

  return (
    <div className="space-y-3">
      {/* 預覽圖片 */}
      <ScreenshotGrid
        screenshotPreviews={value.map((v) => v.url)}
        removeScreenshot={handleRemove}
      />

      {/* 上傳按鈕區塊 */}
      {value.length < max && (
        <div
          className="h-32 bg-[#36393f] rounded border border-dashed border-[#4f545c] flex items-center justify-center cursor-pointer hover:bg-[#40444b]"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            disabled={uploading}
            type="file"
            accept="image/*,video/*,.pdf,.zip,.txt,.doc,.docx"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <label className="cursor-pointer flex flex-col items-center text-gray-400 hover:text-white">
            <Upload size={24} />
            <span className="mt-2 text-sm">
              {uploading ? "上傳中..." : "上傳附件"}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
