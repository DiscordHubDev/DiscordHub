import { notFound } from 'next/navigation';
import { getBot } from '@/lib/actions/bots';
import { Metadata } from 'next';
import BotDetailClient from './client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getCachedAllBots, getCachedBot } from '@/lib/utils';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const allBots = await getCachedAllBots();
    return allBots.map(bot => ({
      id: bot.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const bot = await getBot(id);

    if (!bot) return {};

    const metaTitle = `${bot.name} - ${bot.tags
      .slice(0, 2)
      .join(' / ')} Discord 機器人 | DiscordHubs`;
    const metaDescription = bot.description;
    const canonicalUrl = `https://dchubs.org/bots/${bot.id}`;

    // 檢查是否為預設圖示
    const isDefaultIcon =
      !bot.icon ||
      bot.icon === 'https://cdn.discordapp.com/embed/avatars/0.png';
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

    // 單獨定義 openGraph images 避免內聯問題
    const openGraphImages = previewImage
      ? [
          {
            url: previewImage,
            width: twitterCard === 'summary_large_image' ? 1200 : 80,
            height: twitterCard === 'summary_large_image' ? 630 : 80,
            alt: `${bot.name} 的預覽圖`,
          },
        ]
      : undefined;

    console.log('Bot metadata debug:', {
      botId: bot.id,
      botName: bot.name,
      hasIcon: Boolean(bot.icon),
      iconUrl: bot.icon,
      isDefaultIcon,
      hasCustomIcon,
      previewImage,
      twitterCard,
    });

    return {
      title: metaTitle,
      description: metaDescription,
      icons: {
        icon: [
          { url: '/favicon.ico' },
          { url: '/icon.png', type: 'image/png' },
        ],
      },
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: canonicalUrl,
        images: openGraphImages,
      },
      twitter: {
        card: twitterCard,
        title: metaTitle,
        description: metaDescription,
        images: previewImage ? [previewImage] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating bot metadata:', error);
    return {};
  }
}

export default async function BotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  // 使用快取函數並行執行查詢
  const [bot, allBots] = await Promise.all([
    getCachedBot(id),
    getCachedAllBots(), // 考慮是否真的需要所有 bots，或者可以只獲取相關的幾個
  ]);

  if (!bot) {
    notFound();
  }

  const isFavorited = userId
    ? bot.favoritedBy?.some(user => user.id === userId)
    : false;

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
