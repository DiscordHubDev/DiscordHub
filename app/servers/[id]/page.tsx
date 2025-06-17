import {
  getAllServers,
  getServerByGuildId,
  getServerWithFavoritedByGuildId,
} from '@/lib/actions/servers';
import { notFound } from 'next/navigation';
import ServerDetailClientPage from './client';
import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { Metadata } from 'next';

const allServers = await getAllServers();

export const revalidate = 60;

export async function generateStaticParams() {
  return allServers.map(server => ({
    id: server.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const server = await getServerByGuildId(id);

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
      icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png' }],
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
}

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  // 然後在呼叫端處理
  const server = await getServerWithFavoritedByGuildId(userId, id);

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
}
