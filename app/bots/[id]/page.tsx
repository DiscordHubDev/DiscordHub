import { notFound } from 'next/navigation';
import BotDetailClient from './client';
import { getAllBots, getBot } from '@/lib/actions/bots';
import { Metadata } from 'next';

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

  return {
    title: `${bot.name} - DiscordHubs`,
    description: bot.description,
    alternates: {
      canonical: `https://dchubs.org/bots/${bot.id}`,
    },
    openGraph: {
      title: `${bot.name} - DiscordHubs`,
      description: bot.description,
      url: `https://dchubs.org/bots/${bot.id}`,
      images: [
        {
          url: `https://dchubs.org/api/og/bot/${bot.id}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${bot.name} - DiscordHubs`,
      description: bot.description,
      images: [`https://dchubs.org/api/og/bot/${bot.id}`],
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
            image: bot.icon,
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
      <BotDetailClient
        allBots={allBots}
        bot={bot}
        isFavorited={isFavorited}
      />{' '}
    </>
  );
}
