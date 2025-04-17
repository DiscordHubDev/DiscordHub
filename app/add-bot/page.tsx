'use client';

import Head from 'next/head';
import { submitBot } from '@/lib/actions/submit-bot';
import { sendNotification } from '@/lib/actions/sendNotification';
import { BotWithRelationsInput } from '@/lib/prisma_type';
import { BotFormData, DiscordBotRPCInfo, Screenshot } from '@/lib/types';
import BotForm from '@/components/form/bot-form/BotForm';

const keywords = [
  '新增 Discord 伺服器',
  'Discord 伺服器添加',
  '創建 Discord 伺服器',
  'Discord 伺服器列表',
  '熱門 Discord 伺服器',
  '免費 Discord 伺服器',
  '人氣 Discord 伺服器',
  'Discord 伺服器推薦',
  '大型 Discord 伺服器',
  '小型 Discord 伺服器',
  '公開 Discord 伺服器',
];

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
      VoteNotificationURL: data.webhook_url || '',
      secret: data.secret || '',
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

  return (
    <>
      <Head>
        <title>新增機器人 | Discord機器人列表 - DiscordHubs</title>
        <meta
          name="description"
          content="DiscordHubs是最佳的 Discord 中文機器人和機器人列表平台，你可以在此新增你的機器人，讓你的機器人得到宣傳和管理，快速建立專屬的社群空間。"
        />
        <meta name="keywords" content={keywords.join('，')} />
        <meta name="author" content="DiscordHubs 團隊" />
        <link rel="author" href="https://dchubs.org" />
        <meta
          property="og:title"
          content="新增機器人 | Discord機器人列表 - DiscordHubs"
        />
        <meta
          property="og:description"
          content="DiscordHubs是最佳的 Discord 中文機器人和機器人列表平台，你可以在此新增你的機器人，讓你的機器人得到宣傳和管理，快速建立專屬的社群空間。"
        />
        <meta property="og:url" content="https://dchubs.org" />
        <meta property="og:site_name" content="DiscordHubs" />
        <meta
          property="og:image"
          content="https://dchubs.org/DCHUSB_banner.png"
        />
        <meta property="og:image:width" content="1012" />
        <meta property="og:image:height" content="392" />
        <meta
          property="og:image:alt"
          content="DiscordHubs Discord伺服器及機器人列表"
        />
        <meta property="og:locale" content="zh-TW" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="https://dchubs.org/dchub.ico" />
      </Head>
      <BotForm mode="create" onSubmit={handleCreate} />
    </>
  );
};

export default AddBotPage;
