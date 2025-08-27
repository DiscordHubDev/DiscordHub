'use client';

import { useEffect, useState } from 'react';
import { Image, FileText, Video } from 'lucide-react'; // 你應該已有
import { UploadedFile } from '@/lib/types';

export default function AttachmentPreview({
  attachment,
}: {
  attachment: UploadedFile;
}) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (attachment.type === 'raw') {
      fetch(attachment.url)
        .then(res => res.text())
        .then(setTextContent)
        .catch(() => setError('無法讀取內容'));
    }
  }, [attachment]);

  const isImage = attachment.type === 'image';
  const isVideo = attachment.type === 'video';
  const isRaw = attachment.type === 'raw';

  return (
    <div className="p-3 bg-[#2F3136] rounded-md space-y-2">
      <div className="flex items-center gap-2 text-sm">
        {isImage && <Image className="h-4 w-4 text-gray-400" />}
        {isVideo && <Video className="h-4 w-4 text-gray-400" />}
        {isRaw && <FileText className="h-4 w-4 text-gray-400" />}
        <span className="break-words">{attachment.original_filename}</span>
      </div>

      {isImage && (
        <div className="w-full overflow-hidden rounded-md border border-[#202225]">
          <img
            src={attachment.url || '/placeholder.png'}
            alt={attachment.original_filename}
            className="w-full h-auto object-contain max-h-[300px]"
          />
        </div>
      )}

      {isVideo && (
        <div className="w-full overflow-hidden rounded-md border border-[#202225]">
          <video
            controls
            src={attachment.url}
            className="w-full max-h-[300px] object-contain"
          />
        </div>
      )}

      {isRaw && (
        <div className="p-2 bg-[#202225] rounded-md text-sm font-mono overflow-x-auto break-words whitespace-pre-wrap">
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            textContent ?? <span className="text-gray-400">載入中...</span>
          )}
        </div>
      )}
    </div>
  );
}
