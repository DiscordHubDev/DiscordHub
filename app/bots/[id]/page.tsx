import { notFound } from 'next/navigation';
import { getAllBots, getBot } from '@/lib/actions/bots';
import { Metadata } from 'next';
import BotDetailClient from './client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const allBots = await getAllBots();

export const revalidate = 60;

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

  const metaTitle = `${bot.name} - ${bot.tags.slice(0, 2).join(' / ')} Discord 機器人 | DiscordHubs`;
  const metaDescription = bot.description;
  const canonicalUrl = `https://dchubs.org/bots/${bot.id}`;
  const isDefaultIcon =
    !bot.icon || bot.icon === 'https://cdn.discordapp.com/embed/avatars/0.png';
  const hasCustomIcon = Boolean(bot.icon) && !isDefaultIcon;
  const hasBanner = Boolean(bot.banner);

  let previewImage: string | undefined;
  let twitterCard: 'summary' | 'summary_large_image' = 'summary';

  if (hasCustomIcon) {
    previewImage = bot.icon!;
    twitterCard = 'summary';
  } else if (hasBanner) {
    previewImage = bot.banner!;
    twitterCard = 'summary_large_image';
  }

  return {
    title: metaTitle,
    description: metaDescription,
    icons: {
      icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png' }],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      images: previewImage
        ? [
            {
              url: previewImage,
              width: twitterCard === 'summary_large_image' ? 1200 : 80,
              height: twitterCard === 'summary_large_image' ? 630 : 80,
              alt: `${bot.name} 的預覽圖`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: twitterCard,
      title: metaTitle,
      description: metaDescription,
      images: previewImage ? [previewImage] : undefined,
    },
  };
}

export default async function BotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);

  const bot = await getBot(id);

  if (!bot) {
    notFound();
  }

  const isFavorited = session ? !!bot.favoritedBy?.length : false;

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
