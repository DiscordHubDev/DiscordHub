// hooks/useInbox.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useInbox() {
  const { data, error, isLoading, mutate } = useSWR('/api/inbox', fetcher);

  const markAsRead = async (mailId: string) => {
    await fetch('/api/inbox', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: mailId }),
    });
    mutate();
  };

  const deleteMail = async (mailId: string) => {
    await fetch(`/api/inbox?id=${mailId}`, { method: 'DELETE' });
    mutate();
  };

  return {
    mails: data ?? [],
    isLoading,
    error,
    refresh: mutate,
    addMail: (m: any) =>
      mutate((prev: any[] = []) => [m, ...prev], { revalidate: false }),
    markAsRead,
    deleteMail,
  };
}
