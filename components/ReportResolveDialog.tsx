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

type Props = {
    reportId: string;
    status: 'resolved' | 'rejected';
    onClose?: () => void;
};

export function ResolveDialog({ reportId, status, onClose }: Props) {
    const [note, setNote] = useState('');
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    const isResolved = status === 'resolved';

    const handleSubmit = async () => {
        setLoading(true);
        await resolveReport({
            reportId,
            status,
            resolutionNote: note,
        });
        setLoading(false);
        setOpen(false);
        onClose?.();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isResolved ? '接受檢舉' : '駁回檢舉'} - 處理說明
                    </DialogTitle>
                    <DialogDescription>
                        請說明您為什麼{isResolved ? '接受' : '駁回'}此舉報。
                    </DialogDescription>
                </DialogHeader>

                <Textarea
                    placeholder="請填寫處理的說明..."
                    rows={5}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
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
