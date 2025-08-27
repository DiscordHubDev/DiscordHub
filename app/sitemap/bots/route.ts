import { getAllBots } from '@/lib/actions/bots';
import { createPriorityCalculator } from '@/lib/utils';

import { ISitemapField, getServerSideSitemap } from 'next-sitemap';

export async function GET() {
  const bots = await getAllBots();
  const calcPriority = createPriorityCalculator({
    voteWeight: 0.7,
    serverWeight: 0.3,
  });

  const scores = bots.map(b => (b.upvotes ?? 0) * 0.6 + (b.servers ?? 0) * 0.4);
  const maxScore = Math.max(...scores, 1);

  const fields: ISitemapField[] = bots.map(bot => ({
    loc: `https://dchubs.org/bots/${bot.id}`,
    lastmod: new Date(bot.createdAt || Date.now()).toISOString(),
    changefreq:
      bot.upvotes > 500 ? 'daily' : bot.upvotes > 100 ? 'weekly' : 'monthly',
    priority: calcPriority(
      { upvotes: bot.upvotes, servers: bot.servers },
      maxScore,
    ),
  }));

  return getServerSideSitemap(fields);
}
