// import { getServerById } from '@/lib/servers'

// export async function generateMetadata({ params }: { params: { id: string } }) {
//   const server = getServerById(params.id)
//   if (!server) return {}

//   const imageUrl = `https://你的網站.com/images/servers/${server.id}.jpg`

//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": "GameServer",
//     "name": server.name,
//     "game": {
//       "@type": "VideoGame",
//       "name": "Minecraft"
//     },
//     "description": server.description,
//     "serverStatus": server.status === 'online' ? 'Online' : 'Offline',
//     "numberOfPlayers": server.players,
//     "url": `https://你的網站.com/servers/${server.id}`
//   }

//   return {
//     title: `${server.name} | 我的平台`,
//     description: server.description,
//     openGraph: {
//       title: server.name,
//       description: server.description,
//       images: [imageUrl],
//       url: `https://你的網站.com/servers/${server.id}`,
//       type: 'website'
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title: server.name,
//       description: server.description,
//       images: [imageUrl]
//     },
//     other: {
//       // JSON-LD 結構化資料
//       'ld+json': JSON.stringify(jsonLd)
//     }
//   }
// }
