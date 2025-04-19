// app/bots/[id]/edit/page.tsx
import { getBotForEdit } from '@/lib/actions/bots';
import BotEditClient from './client';

export default async function BotEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bot = await getBotForEdit(id);

  if (!bot) return <div className="text-white p-4">找不到機器人</div>;

  return <BotEditClient bot={bot} />;
}
