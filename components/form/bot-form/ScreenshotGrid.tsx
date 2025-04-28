'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type Props = {
  screenshotPreviews: string[];
  removeScreenshot: (index: number) => void;
};

export default function ScreenshotGrid({
  screenshotPreviews,
  removeScreenshot,
}: Props) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewImage(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {screenshotPreviews.map((preview, index) => (
          <div key={index} className="relative group">
            <img
              src={preview || '/placeholder.svg'}
              alt={`Screenshot ${index + 1}`}
              className="w-full h-32 object-cover rounded border border-[#1e1f22] cursor-pointer"
              onClick={() => setPreviewImage(preview)}
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-[#1e1f22] text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => removeScreenshot(index)}
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative w-full h-full"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="預覽圖片"
              className="w-full h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded-full cursor-pointer"
              onClick={() => setPreviewImage(null)}
            >
              <X size={30} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
