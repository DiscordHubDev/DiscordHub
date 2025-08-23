const DISCORD_API_BASE = 'https://discord.com/api/v10';
const BOT_TOKEN = process.env.BOT_TOKEN!;

/**
 * 驗證使用者是否為伺服器擁有者
 */
export async function verifyServerOwnership(
  serverId: string,
  userId: string,
): Promise<false | { isOwner: boolean; owner_id: string }> {
  try {
    const res = await fetch(`${DISCORD_API_BASE}/guilds/${serverId}`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });

    if (!res.ok) {
      console.error(
        'Discord API guilds/:id 失敗',
        res.status,
        await res.text(),
      );
      return false;
    }

    const guild = (await res.json()) as {
      id: string;
      name: string;
      owner_id: string;
    };

    return { isOwner: guild.owner_id === userId, owner_id: guild.owner_id };
  } catch (error) {
    console.error('驗證伺服器擁有權失敗:', error);
    return false;
  }
}

/**
 * 從 Discord API 獲取伺服器真實資訊
 */
export async function fetchDiscordServerInfo(serverId: string) {
  try {
    const res = await fetch(
      `${DISCORD_API_BASE}/guilds/${serverId}?with_counts=true`,
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
        },
      },
    );

    if (!res.ok) {
      console.error(
        'Discord API guilds/:id 失敗',
        res.status,
        await res.text(),
      );
      return {
        memberCount: 0,
        onlineCount: 0,
        icon: null,
      };
    }

    const guild = (await res.json()) as {
      id: string;
      name: string;
      icon: string | null;
      approximate_member_count?: number;
      approximate_presence_count?: number;
    };

    return {
      memberCount: guild.approximate_member_count ?? 0,
      onlineCount: guild.approximate_presence_count ?? 0,
      icon: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : null,
    };
  } catch (error) {
    console.error('獲取Discord伺服器資訊失敗:', error);
    return {
      memberCount: 0,
      onlineCount: 0,
      icon: null,
    };
  }
}
