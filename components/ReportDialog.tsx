'use client';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { submitReport } from '@/lib/actions/report';
import { AttachmentUploader } from './AttachmentUploader';
import { UploadedFile } from '@/lib/types';
import { useError } from '@/context/ErrorContext';

export function ReportDialog({
  itemId,
  itemName,
  type,
}: {
  itemId: string;
  itemName: string;
  type: 'bot' | 'server';
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const severity = 'untagged'; // 可改為下拉選單支援

  const [subjectError, setSubjectError] = useState('');
  const [contentError, setContentError] = useState('');

  const { data: session } = useSession();

  const { showError } = useError();

  if (session?.error === 'RefreshAccessTokenError') {
    return;
  }

  const userId = session?.discordProfile?.id;

  const handleSubmit = async () => {
    let hasError = false;
    setSubjectError('');
    setContentError('');

    if (!userId) {
      showError('請先登入才能檢舉！');
      return;
    }

    if (subject.trim().length < 5) {
      setSubjectError('標題至少需要 5 個字');
      hasError = true;
    }

    if (content.trim().length < 20) {
      setContentError('內容至少需要 20 個字');
      hasError = true;
    }

    if (hasError) return;

    try {
      await submitReport({
        subject,
        content,
        itemId,
        itemName,
        type,
        severity,
        attachments: attachments,
        reportedById: userId,
      });

      toast.success('檢舉已提交！');
      setOpen(false);
      setSubject('');
      setContent('');
      setAttachments([]);
    } catch (err: any) {
      showError('提交失敗：' + err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 transition-all duration-150 transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <AlertCircle className="h-5 w-5" />
          檢舉
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            檢舉{type === 'bot' ? '機器人' : '伺服器'}：{itemName}
          </DialogTitle>
          <DialogDescription>
            請詳細描述問題並上傳證據，我們會盡快核實並處理。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 標題 */}
          <div>
            <label
              htmlFor="report-subject"
              className="block text-sm text-gray-300 mb-1"
            >
              檢舉標題
            </label>
            <input
              id="report-subject"
              type="text"
              value={subject}
              onChange={e => {
                setSubject(e.target.value);
                if (subjectError && e.target.value.trim().length >= 5) {
                  setSubjectError('');
                }
              }}
              placeholder="例如：違規發言、詐騙等"
              className={`w-full px-3 py-2 rounded bg-zinc-800 text-white placeholder-gray-500 border ${
                subjectError ? 'border-red-500' : 'border-zinc-700'
              } focus:outline-none focus:ring-2 ${
                subjectError ? 'focus:ring-red-500' : 'focus:ring-indigo-500'
              }`}
            />
            {subjectError && (
              <p className="text-red-500 text-sm mt-1">{subjectError}</p>
            )}
          </div>

          {/* 描述 */}
          <div>
            <label
              htmlFor="report-content"
              className="block text-sm text-gray-300 mb-1"
            >
              詳細內容
            </label>
            <textarea
              id="report-content"
              value={content}
              onChange={e => {
                setContent(e.target.value);
                if (contentError && e.target.value.trim().length >= 10) {
                  setContentError('');
                }
              }}
              placeholder="請詳細描述違規情況、違規行為、證據說明等等..."
              rows={4}
              className={`w-full px-3 py-2 rounded bg-zinc-800 text-white placeholder-gray-500 border ${
                contentError ? 'border-red-500' : 'border-zinc-700'
              } focus:outline-none focus:ring-2 ${
                contentError ? 'focus:ring-red-500' : 'focus:ring-indigo-500'
              }`}
            />
            {contentError && (
              <p className="text-red-500 text-sm mt-1">{contentError}</p>
            )}
          </div>

          {/* 附件 */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">上傳附件</label>
            <AttachmentUploader value={attachments} onChange={setAttachments} />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-red-600 hover:bg-red-800 text-white"
          >
            送出檢舉
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
