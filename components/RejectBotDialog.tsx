'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type RejectBotDialogProps = {
  botId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
};

export default function RejectBotDialog({
  botId,
  isOpen,
  onClose,
  onConfirm,
}: RejectBotDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(botId, reason.trim());
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>請輸入拒絕原因</DialogTitle>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="請詳細說明機器人未通過審核的原因..."
          className="min-h-[120px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!reason.trim()}>
            確認拒絕
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
