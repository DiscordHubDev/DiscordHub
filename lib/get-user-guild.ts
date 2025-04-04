type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  permissions: number;
};

export type ServerInfo = {
  id: string;
  name: string;
  icon: string;
  banner: string; // URL or fallback color
  memberCount?: number;
  isInServer: boolean;
};

type GuildResult = {
  activeServers: ServerInfo[];
  inactiveServers: ServerInfo[];
};

const hasManageGuildPermission = (permissions: number) => {
  return (permissions & 0x20) === 0x20;
};

const getGuildDetails = async (guildId: string, botToken: string) => {
  const res = await fetch(`https://discord.com/api/guilds/${guildId}`, {
    headers: {
      Authorization: `Bot ${botToken}`,
    },
  });

  if (!res.ok) return null;

  const data = await res.json();

  console.log(guildId, data);

  return {
    banner: data.banner
      ? `https://cdn.discordapp.com/banners/${data.id}/${data.banner}.png`
      : "",
    memberCount: data.approximate_member_count ?? undefined,
  };
};

export async function getUserGuildsWithBotStatus(
  userAccessToken: string,
  botToken: string
): Promise<GuildResult> {
  const userGuildsRes = await fetch(
    "https://discord.com/api/users/@me/guilds",
    {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    }
  );

  if (!userGuildsRes.ok) {
    const errorJson = await userGuildsRes.json(); // 可選，顯示錯誤訊息內容
    console.error("Discord API Error:", errorJson);
    throw new Error("Failed to fetch user guilds");
  }

  const userGuilds: DiscordGuild[] = await userGuildsRes.json();
  const manageableGuilds = userGuilds.filter((g) =>
    hasManageGuildPermission(g.permissions)
  );

  const botGuildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bot ${botToken}`,
    },
  });

  if (!botGuildsRes.ok) {
    const errorJson = await botGuildsRes.json(); // 可選，顯示錯誤訊息內容
    console.error("Discord API Error:", errorJson);
    throw new Error("Failed to fetch bot guilds");
  }

  const botGuilds: DiscordGuild[] = await botGuildsRes.json();
  const botGuildIds = botGuilds.map((g) => g.id);

  const activeServers: ServerInfo[] = [];
  const inactiveServers: ServerInfo[] = [];

  for (const guild of manageableGuilds) {
    const isInServer = botGuildIds.includes(guild.id);

    if (isInServer) {
      const details = await getGuildDetails(guild.id, botToken);
      activeServers.push({
        id: guild.id,
        name: guild.name,
        icon: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
          : "",
        banner: details?.banner ?? "",
        memberCount: details?.memberCount,
        isInServer: true,
      });
    } else {
      inactiveServers.push({
        id: guild.id,
        name: guild.name,
        icon: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
          : "",
        banner: "",
        isInServer: false,
      });
    }
  }

  return {
    activeServers,
    inactiveServers,
  };
}
