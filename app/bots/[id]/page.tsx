import { notFound } from 'next/navigation';
import { getAllBots, getBot } from '@/lib/actions/bots';
import { Metadata } from 'next';
import BotDetailClient from './client';

const allBots = await getAllBots();

export async function generateStaticParams() {
  return allBots.map(bot => ({
    id: bot.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const bot = await getBot(id);

  if (!bot) return {};

  const ogImages = [];

  if (bot.icon) {
    ogImages.push({
      url: bot.icon,
      width: 80,
      height: 80,
      alt: 'bot-icon',
    });
  } else {
    ogImages.push({
      url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      width: 80,
      height: 80,
      alt: 'bot-icon',
    });
  }

  if (bot.banner) {
    ogImages.push({
      url: bot.banner,
      width: 960,
      height: 540,
      alt: 'bot-banner',
    });
  }

  return {
    title: `${bot.name} - ${bot.tags.slice(0, 3).join(' / ')} Discord 機器人 | DiscordHubs`,
    description: bot.description,
    icons: {
      icon: '/favicon.ico',
    },
    alternates: {
      canonical: `https://dchubs.org/bots/${bot.id}`,
    },
    openGraph: {
      title: `${bot.name} - ${bot.tags.slice(0, 3).join(' / ')} Discord 機器人 | DiscordHubs`,
      description: bot.description,
      url: `https://dchubs.org/bots/${bot.id}`,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${bot.name} - ${bot.tags.slice(0, 3).join(' / ')} Discord 機器人 | DiscordHubs`,
      description: bot.description,
      images: [bot.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'],
    },
  };
}

export default async function BotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bot = await getBot(id);

  if (!bot) {
    notFound();
  }

  const isFavorited = !!bot.favoritedBy?.length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: bot.name,
            applicationCategory: 'SocialNetworkingApplication',
            description: bot.description,
            url: `https://dchubs.org/bots/${bot.id}`,
            image: bot.icon || 'https://cdn.discordapp.com/embed/avatars/0.png',
            interactionStatistic: [
              {
                '@type': 'InteractionCounter',
                interactionType: {
                  '@type': 'LikeAction',
                },
                userInteractionCount: bot.upvotes,
              },
              {
                '@type': 'InteractionCounter',
                interactionType: {
                  '@type': 'UseAction',
                },
                userInteractionCount: bot.servers,
              },
            ],
          }),
        }}
      />
      <BotDetailClient allBots={allBots} bot={bot} isFavorited={isFavorited} />
    </>
  );
}
