import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function ServerCard({ server }) {
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
