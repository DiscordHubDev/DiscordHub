import { getAllServers } from '@/lib/actions/servers';
import { ISitemapField, getServerSideSitemap } from 'next-sitemap';
import { createPriorityCalculator } from "@/lib/utils";

export async function GET() {
  const servers = await getAllServers();
  const calcPriority = createPriorityCalculator({ voteWeight: 0.6, serverWeight: 0.4 }); // 可以不同配比

  const scores = servers.map(s => (s.upvotes ?? 0) * 0.6 + (s.members ?? 0) * 0.4);
  const maxScore = Math.max(...scores, 1);

  const fields: ISitemapField[] = servers.map(server => ({
    loc: `https://dchubs.org/servers/${server.id}`,
    lastmod: new Date(server.createdAt || Date.now()).toISOString(),
    changefreq: 'weekly',
    priority: calcPriority(
      { upvotes: server.upvotes, servers: server.members },
      maxScore
    ),
  }));

  return await getServerSideSitemap(fields);   
}
