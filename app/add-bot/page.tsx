'use client';

import { submitBot } from '@/lib/actions/submit-bot';
import { sendNotification } from '@/lib/actions/sendNotification';
import { BotWithRelationsInput } from '@/lib/prisma_type';
import { BotFormData, DiscordBotRPCInfo, Screenshot } from '@/lib/types';
import BotForm from '@/components/form/bot-form/BotForm';

const AddBotPage = () => {
  const handleCreate = async (data: BotFormData, screenshots: Screenshot[]) => {
    const client_id = new URL(data.botInvite).searchParams.get('client_id');
    if (!client_id) {
      throw new Error('Invite link 無效，找不到 client_id');
    }

    const res = await fetch(
      `https://discord.com/api/v10/applications/${client_id.trim()}/rpc`,
      {
        headers: {
          'User-Agent': 'DiscordHubs/1.0',
        },
      },
    );

    if (!res.ok) {
      throw new Error(
        `找不到此 Bot 或 Discord API 錯誤 (status: ${res.status})`,
      );
    }

    const rpcData: DiscordBotRPCInfo = await res.json();

    const commandPayload = data.commands.map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      usage: cmd.usage,
      category: cmd.category ?? null,
      botId: client_id,
    }));

    const icon = `https://cdn.discordapp.com/app-icons/${client_id}/${rpcData.icon}.png`;

    const botData: BotWithRelationsInput = {
      id: client_id,
      name: data.botName,
      description: data.botDescription,
      longDescription: data.botLongDescription || null,
      tags: data.tags,
      servers: 0,
      users: 0,
      upvotes: 0,
      icon: icon,
      banner: null,
      featured: false,
      createdAt: new Date(),
      prefix: data.botPrefix,
      developers: data.developers.map(dev => ({ id: dev.name })),
      website: data.botWebsite || null,
      status: 'pending',
      inviteUrl: data.botInvite,
      supportServer: data.botSupport || null,
      verified: false,
      features: [],
      screenshots: screenshots.map(s => s.url),
      commands: commandPayload,
    };

    await submitBot(botData);
    await sendNotification({
      subject: '已收到審核請求',
      teaser: `${data.botName} 審核請求`,
      content: `感謝您的申請！我們已收到您的審核請求，通常會在 1～2 個工作天內完成審核。\n審核結果將會同樣於此收件匣通知您，請定時確認以免影響自身權益。\n如審核後的一段時間都仍未收到回覆，請至支援群組開單詢問。`,
    });
  };

  return <BotForm mode="create" onSubmit={handleCreate} />;
};

export default AddBotPage;
