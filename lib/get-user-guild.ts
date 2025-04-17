import { is } from 'date-fns/locale';

type BaseServerInfo = {
  id: string;
  name: string;
  icon: string;
  banner: string;
  isInServer: boolean;
};

export type ActiveServerInfo = BaseServerInfo & {
  owner: string;
  memberCount: number;
  OnlineMemberCount: number;
  isPublished: boolean;
};

export type InactiveServerInfo = BaseServerInfo & {
  isPublished: boolean;
};

export type ServerInfo = ActiveServerInfo | InactiveServerInfo;

type GuildResult = {
  activeServers: ActiveServerInfo[];
  inactiveServers: InactiveServerInfo[];
};

type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  permissions: number;
};

const BOT_TOKEN = process.env.BOT_TOKEN;

const hasManageGuildPermission = (permissions: number) => {
  return (permissions & 0x20) === 0x20;
};

export async function getGuildDetails(
  guildId: string,
): Promise<ActiveServerInfo | null> {
  const res = await fetch(
    `https://discord.com/api/guilds/${guildId}?with_counts=true`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    },
  );

  if (!res.ok) return null;

  const data = await res.json();

  return {
    id: data.id,
    name: data.name,
    icon: data.icon
      ? `https://cdn.discordapp.com/icons/${data.id}/${data.icon}.png`
      : '',
    banner: data.banner
      ? `https://cdn.discordapp.com/banners/${data.id}/${data.banner}.png`
      : '',
    owner: data.owner_id,
    memberCount: data.approximate_member_count ?? 0,
    OnlineMemberCount: data.approximate_presence_count ?? 0,
    isInServer: true,
    isPublished: false,
  };
}

export async function getUserGuildsWithBotStatus(
  userAccessToken: string,
): Promise<GuildResult> {
  const userGuildsRes = await fetch(
    'https://discord.com/api/users/@me/guilds',
    {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    },
  );

  if (!userGuildsRes.ok) {
    const errorJson = await userGuildsRes.text();
    console.error('Discord API Error:', errorJson);
    throw new Error('Failed to fetch user guilds');
  }

  const userGuilds: DiscordGuild[] = await userGuildsRes.json();

  const manageableGuilds = userGuilds.filter(g =>
    hasManageGuildPermission(g.permissions),
  );

  const botGuildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
    },
  });

  if (!botGuildsRes.ok) {
    const errorJson = await botGuildsRes.text();
    console.error('Discord API Error:', errorJson);
    throw new Error('Failed to fetch bot guilds');
  }

  const botGuilds: DiscordGuild[] = await botGuildsRes.json();
  const botGuildIds = botGuilds.map(g => g.id);

  const activeServers: ActiveServerInfo[] = [];
  const inactiveServers: InactiveServerInfo[] = [];

  for (const guild of manageableGuilds) {
    const isInServer = botGuildIds.includes(guild.id);

    const baseData = {
      id: guild.id,
      name: guild.name,
      icon: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : '',
      banner: '',
      isInServer,
      isPublished: false,
    };

    if (isInServer) {
      const details = await getGuildDetails(guild.id);
      if (details) {
        activeServers.push(details);
      }
    } else {
      inactiveServers.push(baseData);
    }
  }

  return {
    activeServers,
    inactiveServers,
  };
}
