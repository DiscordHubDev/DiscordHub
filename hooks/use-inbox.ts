// hooks/useInbox.ts
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

function transformNotification(n: any) {
  return {
    id: n.id,
    content: n.content,
    name: n.name ?? '系統通知',
    createdAt: new Date(n.createdAt).toISOString().split('T')[0],
    subject: n.subject,
    teaser: n.teaser ?? '',
    priority: n.priority,
    isSystem: n.userId === null,
    read: n.read,
  };
}

export function useInbox() {
  const { data: session } = useSession();
  const userId = session?.discordProfile?.id;
  const [mails, setMails] = useState<any[]>([]);

  const markAsRead = async (mailId: string) => {
    await supabase.from('Notification').update({ read: true }).eq('id', mailId);

    setMails(prev =>
      prev.map(mail => (mail.id === mailId ? { ...mail, read: true } : mail)),
    );
  };

  const deleteMail = async (mailId: string) => {
    setMails(prev => prev.filter(mail => mail.id !== mailId));

    const { error } = await supabase
      .from('Notification')
      .delete()
      .eq('id', mailId);

    if (error) {
      console.error('❌ 刪除失敗：', error);
      throw error;
    }
  };

  const { data, error, isLoading, mutate } = useSWR(
    userId ? ['inbox', userId] : null,
    async () => {
      const { data, error } = await supabase
        .from('Notification')
        .select('*')
        .or(`userId.eq.${userId},userId.is.null`)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return data.map(transformNotification);
    },
  );

  useEffect(() => {
    if (data) setMails(data);
  }, [data]);

  const addMail = (newRawMail: any) => {
    console.log('newMail', newRawMail);
    const newMail = transformNotification(newRawMail);
    setMails(prev => [newMail, ...prev]);
  };

  return {
    mails,
    isLoading,
    error,
    refresh: mutate,
    addMail,
    markAsRead,
    deleteMail,
  };
}
