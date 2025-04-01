import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for Discord servers
const mockServers = [
  {
    id: "1",
    name: "Gaming Paradise",
    icon: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=200&width=400",
    description:
      "A community for gamers of all types. Join us for daily events, tournaments, and game discussions!",
    memberCount: 15243,
    categories: ["Gaming", "Esports", "Community"],
    tags: ["FPS", "RPG", "MMORPG", "Casual"],
    online: 1243,
    verified: true,
    featured: true,
  },
  {
    id: "2",
    name: "Anime Club",
    icon: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=200&width=400",
    description:
      "Discuss your favorite anime, manga, and Japanese culture. Weekly watch parties and seasonal reviews!",
    memberCount: 8765,
    categories: ["Anime", "Entertainment", "Community"],
    tags: ["Manga", "Cosplay", "Discussion"],
    online: 765,
    verified: true,
    featured: false,
  },
  {
    id: "3",
    name: "Developers Hub",
    icon: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=200&width=400",
    description:
      "A place for developers to share knowledge, get help, and collaborate on projects. All programming languages welcome!",
    memberCount: 12456,
    categories: ["Technology", "Programming", "Education"],
    tags: ["JavaScript", "Python", "Web Dev", "Mobile Dev"],
    online: 1056,
    verified: true,
    featured: true,
  },
  {
    id: "4",
    name: "Music Lovers",
    icon: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=200&width=400",
    description:
      "Share your favorite music, discover new artists, and join our music production workshops!",
    memberCount: 6543,
    categories: ["Music", "Entertainment", "Arts"],
    tags: ["Production", "Listening", "Instruments"],
    online: 543,
    verified: false,
    featured: false,
  },
  {
    id: "5",
    name: "Art Gallery",
    icon: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=200&width=400",
    description:
      "A community for artists to share their work, get feedback, and participate in art challenges!",
    memberCount: 7890,
    categories: ["Art", "Design", "Creative"],
    tags: ["Digital Art", "Traditional", "Animation"],
    online: 690,
    verified: false,
    featured: true,
  },
  {
    id: "6",
    name: "Movie Buffs",
    icon: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=200&width=400",
    description:
      "Discuss films, TV shows, and everything cinema. Weekly movie nights and review sessions!",
    memberCount: 5432,
    categories: ["Movies", "Entertainment", "Discussion"],
    tags: ["Reviews", "Classics", "New Releases"],
    online: 432,
    verified: false,
    featured: false,
  },
  {
    id: "7",
    name: "Fitness Community",
    icon: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=200&width=400",
    description:
      "Get fit together! Share workout routines, nutrition tips, and motivate each other to reach fitness goals!",
    memberCount: 9876,
    categories: ["Fitness", "Health", "Lifestyle"],
    tags: ["Workout", "Nutrition", "Motivation"],
    online: 876,
    verified: true,
    featured: false,
  },
  {
    id: "8",
    name: "Book Club",
    icon: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=200&width=400",
    description:
      "A community for book lovers. Monthly book discussions, author spotlights, and reading challenges!",
    memberCount: 4321,
    categories: ["Books", "Literature", "Education"],
    tags: ["Fiction", "Non-Fiction", "Fantasy", "Sci-Fi"],
    online: 321,
    verified: false,
    featured: false,
  },
];

// Categories for filtering
const categories = [
  "All",
  "Gaming",
  "Anime",
  "Technology",
  "Music",
  "Art",
  "Movies",
  "Fitness",
  "Books",
  "Community",
  "Entertainment",
  "Education",
];

export default function ServersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Discord Servers</h1>
          <p className="text-muted-foreground">
            Discover and join amazing Discord communities
          </p>
        </div>

        <div className="grid gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center space-x-2 md:w-2/3">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search servers by name, description, or tags..."
                  className="w-full pl-8"
                />
              </div>
              <Button>Search</Button>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="members">Most Members</SelectItem>
                  <SelectItem value="online">Most Online</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <span className="sr-only md:not-sr-only md:inline-block">
                  Filters
                </span>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all">
            <div className="overflow-x-auto">
              <TabsList className="mb-4 flex h-auto w-max space-x-2 p-1">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category.toLowerCase()}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent value="all" className="mt-0">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mockServers.map((server) => (
                  <ServerCard key={server.id} server={server} />
                ))}
              </div>
            </TabsContent>
            {categories.slice(1).map((category) => (
              <TabsContent
                key={category}
                value={category.toLowerCase()}
                className="mt-0"
              >
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {mockServers
                    .filter((server) => server.categories.includes(category))
                    .map((server) => (
                      <ServerCard key={server.id} server={server} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ServerCard({ server }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-32 w-full overflow-hidden">
        <img
          src={server.banner || "/placeholder.svg"}
          alt={`${server.name} banner`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          {server.verified && (
            <Badge variant="secondary" className="bg-blue-500 text-white">
              Verified
            </Badge>
          )}
          {server.featured && (
            <Badge variant="secondary" className="bg-purple-500 text-white">
              Featured
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <img
          src={server.icon || "/placeholder.svg"}
          alt={`${server.name} icon`}
          className="h-16 w-16 rounded-full border-4 border-background object-cover"
          style={{ marginTop: "-2rem" }}
        />
        <div>
          <h3 className="font-semibold">{server.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="flex items-center">
              <span className="mr-1 h-2 w-2 rounded-full bg-green-500" />
              {server.online.toLocaleString()} Online
            </span>
            <span className="mx-2">•</span>
            <span>{server.memberCount.toLocaleString()} Members</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {server.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {server.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {server.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{server.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/servers/${server.id}`}>View Details</Link>
        </Button>
        <Button size="sm">Join Server</Button>
      </CardFooter>
    </Card>
  );
}
