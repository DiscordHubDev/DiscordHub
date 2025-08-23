// app/upload/actions.ts
'use server';

import { v2 as cloudinary } from 'cloudinary';
import { Screenshot, UploadedFile } from '../types';
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

type CloudinarySignature = {
  timestamp: number; // UNIX timestamp (秒)
  signature: string; // 由 api_secret 簽出來的字串
  apiKey: string; // Cloudinary 的 API key（可以公開）
  uploadPreset: string; // Cloudinary 的上傳 preset 名稱
  cloudName: string; // Cloudinary 的 cloud name
};

const isUploadedFileArray = (arr: unknown): arr is UploadedFile[] =>
  Array.isArray(arr) &&
  arr.every(
    x =>
      x &&
      typeof (x as any).url === 'string' &&
      typeof (x as any).public_id === 'string',
  );

export async function ScreenshotUpload(
  sig: CloudinarySignature,
  fileArray: File[],
): Promise<UploadedFile[]> {
  const images = fileArray.filter(f => f.type?.startsWith('image/'));
  if (images.length === 0) return [];

  const uploads = images.map(async file => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sig.apiKey);
    formData.append('timestamp', String(sig.timestamp));
    formData.append('signature', sig.signature);
    formData.append('upload_preset', sig.uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      { method: 'POST', body: formData },
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(`${file.name}: ${res.status} ${res.statusText}`);

    return {
      url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      type: 'image',
      original_filename: data.original_filename ?? file.name,
    } as UploadedFile;
  });

  return (await Promise.allSettled(uploads)).flatMap(r =>
    r.status === 'fulfilled' ? [r.value] : [],
  );
}

export async function getCloudinarySignature() {
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      upload_preset: process.env.NEXT_PUBLIC_UPLOAD_PRESET!,
    },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    uploadPreset: process.env.NEXT_PUBLIC_UPLOAD_PRESET!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  };
}

export async function deleteCloudinaryImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.error('刪除 Cloudinary 圖片失敗：', error);
    throw error;
  }
}
