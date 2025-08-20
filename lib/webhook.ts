'use server';

import { botFormSchema } from '@/schemas/add-bot-schema';
import { BotType, EditServerType, ServerType, UserType } from './prisma_type';
import { z } from 'zod';
import { ServerFormSchema } from '@/schemas/add-server-schema';
import { ActiveServerInfo } from './get-user-guild';

export const sendWebhook = async (
  type: 'server' | 'bot',
  user: UserType,
  id: string,
  server?: ServerType,
  bot?: BotType,
) => {
  const target = (server ?? bot)!;
  const webhookUrl = process.env.VOTE_WEBHOOK_URL || '';
  console.log('Sending webhook to:', webhookUrl);
  const username = user?.username;
  const userid = user?.id;
  const voteItem = type === 'server' ? '伺服器' : '機器人';
  const embed = {
    title: `<:pixel_symbol_exclamation_invert:1361299311131885600> | 投票系統`,
    description: `➤用戶：**${username}**\n➤用戶ID：**${userid}**\n> ➤對**${voteItem}**：**${target.name}** 進行了投票\n> ➤${voteItem}ID：**${id}**`,
    color: 0x4285f4,
  };

  const data = {
    embeds: [embed],
    username: 'DcHubs投票通知',
    avatar_url:
      'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
  };
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Webhook 發送失敗:', response.statusText);
    } else {
    }
  } catch (error) {
    console.error('發送 Webhook 時出錯:', error);
  }
};

export const sendApprovedWebhook = async (app: BotType) => {
  const webhookUrl = process.env.APPROVED_WEBHOOK_URL || '';
  const developerNames = app.developers
    .map(dev => dev.username || '未知')
    .join('\n');
  const embed = {
    title: `<:pixel_symbol_exclamation_invert:1361299311131885600> | 新機器人發佈通知！`,
    description: `➤機器人名稱：**${app.name}**\n➤機器人前綴：**${app.prefix}**\n➤簡短描述：\`\`\`${app.description}\`\`\`\n➤開發者：\`\`\`${developerNames}\`\`\`\n➤邀請鏈結：\n> ${app.inviteUrl}\n➤網站連結：\n> https://dchubs.org/bots/${app.id || '無'}\n➤類別：\`\`\`${app.tags.join('\n')}\`\`\``,
    color: 0x4285f4,
    footer: {
      text: '由 DiscordHubs 系統發送',
      icon_url:
        'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
    },
    thumbnail: {
      url: app.icon || '',
    },
    image: {
      url: app.banner || '',
    },
  };

  const webhookData = {
    content: '<@&1355617017549426919>',
    embeds: [embed],
    username: 'DcHubs機器人通知',
    avatar_url:
      'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      console.error('Webhook 發送失敗:', response.statusText);
    } else {
    }
  } catch (webhookError) {
    console.error('發送 Webhook 時出錯:', webhookError);
  }
};

type FormData = z.infer<typeof botFormSchema>;

export const sendPendingWebhook = async (data: FormData, avatarUrl: string) => {
  const webhookUrl = process.env.PENDING_WEBHOOK_URL || '';
  const embed = {
    title: `<:pixel_symbol_exclamation_invert:1361299311131885600> | 新審核機器人！`,
    description: `➤機器人名稱：**${data.botName}**\n➤機器人前綴：**${data.botPrefix}**\n➤簡短描述：\`\`\`${data.botDescription}\`\`\`\n➤類別：\`\`\`${data.tags.join('\n')}\`\`\``,
    color: 0x4285f4,
    footer: {
      text: '由 DiscordHubs 系統發送',
      icon_url:
        'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
    },
    thumbnail: {
      url: avatarUrl || '',
    },
  };
  const webhookData = {
    content:
      '<@&1361412309209317468> <@549056425943629825> <@857502876108193812>',
    embeds: [embed],
    username: 'DcHubs機器人通知',
    avatar_url:
      'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
  };
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });
    if (!response.ok) {
      console.error('Webhook 發送失敗:', response.statusText);
    } else {
    }
  } catch (webhookError) {
    console.error('發送 Webhook 時出錯:', webhookError);
  }
};

type FormSchemaType = z.infer<typeof ServerFormSchema>;

export const sendServerWebhook = async (
  data: FormSchemaType,
  activeServer: ActiveServerInfo | EditServerType,
) => {
  const webhookUrl = process.env.SERVER_WEBHOOK_URL || '';
  const embed = {
    title: `<:pixel_symbol_exclamation_invert:1361299311131885600> | 新發佈的伺服器！`,
    description: `➤伺服器名稱：**${data.serverName}**\n➤簡短描述：\n\`\`\`${data.shortDescription}\`\`\`\n➤邀請連結：\n> **${data.inviteLink}**\n➤網站連結：\n> **https://dchubs.org/servers/${activeServer?.id || '無'}**\n➤類別：\n\`\`\`${data.tags.join('\n')}\`\`\``,
    color: 0x4285f4,
    thumbnail: {
      url: activeServer?.icon || '',
    },
    image: {
      url: activeServer?.banner || '',
    },
    footer: {
      text: '由 DiscordHubs 系統發送',
      icon_url:
        'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
    },
  };

  const webhookData = {
    content: '<@&1355617333967585491>',
    embeds: [embed],
    username: 'DcHubs伺服器通知',
    avatar_url:
      'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      console.error('Webhook 發送失敗:', response.statusText);
    } else {
    }
  } catch (webhookError) {
    console.error('發送 Webhook 時出錯:', webhookError);
  }
};
