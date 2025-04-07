'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { resolveReport } from '@/lib/actions/report';
import { sendNotification } from '@/lib/actions/sendNotification';
import { ReportInBoxType } from '@/lib/prisma_type';

type Props = {
  report: ReportInBoxType;
  status: 'resolved' | 'rejected';
  onClose?: () => void;
};

function getReviewResultMessage(isResolved: boolean): string {
  if (isResolved) {
    return `我們已確認你的檢舉內容是違反規定的，並已對相關項目採取了處理措施。感謝您幫助我們維護DiscordHubs的品質！`;
  } else {
    return `很遺憾，我們仔細審查了你的檢舉，但內容目前尚未達到處理標準，故未採取進一步行動。如有疑慮或有新證據，歡迎再次回報！`;
  }
}

export function ResolveDialog({ report, status, onClose }: Props) {
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const isResolved = status === 'resolved';

  const handleSubmit = async () => {
    setLoading(true);
    await resolveReport({
      reportId: report.id,
      status,
      resolutionNote: note,
    });
    setLoading(false);
    setOpen(false);
    onClose?.();
    await sendNotification({
      subject: '您的檢舉已處理完畢',
      teaser: '我們審查了您的檢舉...',
      content: `
                我們審查了您於 ${report.reportedAt.toDateString()} 提出的檢舉。
                
                檢舉標題為：${report.subject}
                檢舉內容為：${report.content}
                
                審查結果：${getReviewResultMessage(isResolved)}
                `.trim(),
      priority: isResolved ? 'success' : 'warning',
      userId: report.reportedBy.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isResolved ? '接受檢舉' : '駁回檢舉'} - 處理說明
          </DialogTitle>
          <DialogDescription>
            請說明您為什麼
            {isResolved ? '接受' : '駁回'}
            此舉報。
          </DialogDescription>
        </DialogHeader>

        <Textarea
          placeholder="請填寫處理的說明..."
          rows={5}
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button disabled={loading || !note} onClick={handleSubmit}>
            {loading ? '送出中...' : '確認送出'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
