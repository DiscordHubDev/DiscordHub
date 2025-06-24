import { notFound } from 'next/navigation';
import ServerDetailClientPage from './client';
import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { Metadata } from 'next';
import {
  getCachedAllServers,
  getCachedServerByGuildId,
  getCachedServerWithFavorited,
} from '@/lib/utils';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const allServers = await getCachedAllServers();
    return allServers.map(server => ({
      id: server.id,
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
    const server = await getCachedServerByGuildId(id); // 使用快取版本

    if (!server) return {};

    const metaTitle = `${server.name} - ${server.tags.slice(0, 2).join(' / ')} Discord 伺服器 | DiscordHubs`;
    const metaDescription = server.description;
    const canonicalUrl = `https://dchubs.org/servers/${server.id}`;

    const isDefaultIcon =
      !server.icon ||
      server.icon === 'https://cdn.discordapp.com/embed/avatars/0.png';
    const hasCustomIcon = Boolean(server.icon) && !isDefaultIcon;
    const hasBanner = Boolean(server.banner);

    let previewImage: string | undefined;
    let twitterCard: 'summary' | 'summary_large_image' = 'summary';

    if (hasCustomIcon) {
      previewImage = server.icon!;
      twitterCard = 'summary';
    } else if (hasBanner) {
      previewImage = server.banner!;
      twitterCard = 'summary_large_image';
    }

    const openGraphImages = previewImage
      ? [
          {
            url: previewImage,
            width: twitterCard === 'summary_large_image' ? 1200 : 80,
            height: twitterCard === 'summary_large_image' ? 630 : 80,
            alt: `${server.name} 的預覽圖`,
          },
        ]
      : undefined;

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
    console.error('Error generating metadata:', error);
    return {};
  }
}

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    const userId = session?.discordProfile?.id;

    // 使用快取版本的並行查詢
    const [server, allServers] = await Promise.all([
      getCachedServerWithFavorited(userId, id),
      getCachedAllServers(),
    ]);

    if (!server) {
      notFound();
    }

    const favoritedIds = new Set(server.favoritedBy.map(user => user.id));
    const isFavorited = userId ? favoritedIds.has(userId) : false;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${server.name} - ${server.tags.slice(0, 2).join(' / ')}`,
      description: server.description,
      url: `https://dchubs.org/servers/${server.id}`,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '首頁',
            item: 'https://dchubs.org',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '伺服器列表',
            item: 'https://dchubs.org/servers',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: server.name,
            item: `https://dchubs.org/servers/${server.id}`,
          },
        ],
      },
      isPartOf: {
        '@type': 'WebSite',
        name: 'DiscordHubs',
        url: 'https://dchubs.org',
      },
      image: server.icon || 'https://dchubs.org/dchub.png',
      mainEntityOfPage: true,
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
        />

        <ServerDetailClientPage
          server={server}
          allServers={allServers}
          isFavorited={isFavorited}
        />
      </>
    );
  } catch (error) {
    console.error('Error in ServerDetailPage:', error);
    notFound();
  }
}
