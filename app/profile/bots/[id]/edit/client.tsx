'use client';

import BotForm from '@/components/form/bot-form/BotForm';
import { updateBot } from '@/lib/actions/bots';
import { BotWithFavorites } from '@/lib/prisma_type';

export default function BotEditClient({ bot }: { bot: BotWithFavorites }) {
  return (
    <BotForm
      key={bot.id}
      mode="edit"
      defaultValues={{
        botName: bot.name,
        botPrefix: bot.prefix || undefined,
        botDescription: bot.description,
        botLongDescription: bot.longDescription || '',
        botInvite: bot.inviteUrl || undefined,
        botWebsite: bot.website || '',
        botSupport: bot.supportServer || '',
        tags: bot.tags,
        developers: bot.developers.map(dev => ({ name: dev.id })),
        webhook_url: bot.VoteNotificationURL || '',
        secret: bot.secret || '',
        commands: bot.commands.map(cmd => ({
          name: cmd.name,
          description: cmd.description,
          usage: cmd.usage,
          category: cmd.category || '',
        })),
      }}
      onSubmit={async (data, screenshots) => {
        await updateBot(bot.id, data, screenshots);
      }}
    />
  );
}
