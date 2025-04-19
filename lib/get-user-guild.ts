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
  admins: string[];
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
const LIMIT = 1000;

const hasManageGuildPermission = (permissions: string | number | bigint) => {
  return (BigInt(permissions) & BigInt(0x20)) === BigInt(0x20);
};

export async function getHaveGuildManagePermissionMembers(
  guildId: string,
): Promise<string[]> {
  let allMembers: any[] = [];
  let after: string | undefined = undefined;

  while (true) {
    const url = new URL(`https://discord.com/api/guilds/${guildId}/members`);
    url.searchParams.set('limit', `${LIMIT}`);
    if (after) url.searchParams.set('after', after);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });

    if (!res.ok) throw new Error(`❌ 取得成員失敗 (${res.status})`);

    const members = await res.json();
    allMembers.push(...members);

    if (members.length < LIMIT) break;
    after = members[members.length - 1].user.id;
  }

  const rolesRes = await fetch(
    `https://discord.com/api/guilds/${guildId}/roles`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    },
  );

  if (!rolesRes.ok) throw new Error(`❌ 取得角色失敗 (${rolesRes.status})`);

  const roles = await rolesRes.json();

  const manageGuildRoleIds = roles
    .filter((role: any) => hasManageGuildPermission(role.permissions))
    .map((role: any) => role.id);

  const qualifiedUserIds = allMembers
    .filter(
      (member: any) =>
        !member.user.bot &&
        (member.roles ?? []).some((roleId: string) =>
          manageGuildRoleIds.includes(roleId),
        ),
    )
    .map((member: any) => member.user.id);

  return qualifiedUserIds;
}

export async function getGuildDetails(
  guildId: string,
): Promise<ActiveServerInfo | null> {
  const res = await safeFetchWithRateLimit(
    `https://discord.com/api/guilds/${guildId}?with_counts=true`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    },
  );

  const managerUserIds = await getHaveGuildManagePermissionMembers(guildId);

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
    admins: managerUserIds,
    isInServer: true,
    isPublished: false,
  };
}

async function safeFetchWithRateLimit(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 429) {
    const data = await res.json();
    const retryAfter = data.retry_after || 1;
    console.warn(`Rate limited. Retrying after ${retryAfter}s`);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return safeFetchWithRateLimit(url, options); // 重试
  }
  return res;
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

  await new Promise(resolve => setTimeout(resolve, 500));

  const botGuildsRes = await safeFetchWithRateLimit(
    'https://discord.com/api/users/@me/guilds',
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    },
  );

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
