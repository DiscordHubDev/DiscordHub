// hooks/useInbox.ts
import { Mail } from '@/lib/types';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useInbox() {
  const { data, error, isLoading, mutate } = useSWR<Mail[]>(
    '/api/inbox',
    fetcher,
  );

  const markAsRead = async (mailId: string) => {
    await fetch('/api/inbox', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: mailId }),
    });
    await mutate();
  };

  const deleteMail = async (mailId: string) => {
    await fetch(`/api/inbox?id=${mailId}`, { method: 'DELETE' });
    await mutate();
  };

  return {
    mails: data ?? [],
    isLoading,
    error,
    refresh: mutate,
    addMail: (m: Mail) =>
      mutate((prev: Mail[] = []) => [m, ...prev], { revalidate: false }),
    markAsRead,
    deleteMail,
  };
}
