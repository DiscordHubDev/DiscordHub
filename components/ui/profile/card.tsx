import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

type ItemCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  tags?: string[];
  children?: ReactNode;
};

const ItemCard = ({
  title,
  description,
  icon,
  actions,
  tags,
  children,
}: ItemCardProps) => {
  return (
    <Card className="hover:scale-105 transition-transform hover:shadow-lg dark:bg-muted/40">
      <CardHeader className="flex flex-row justify-between items-start space-y-0">
        <div className="flex gap-4 items-center">
          {icon && (
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center dark:bg-muted-foreground/10">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
            {tags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default ItemCard;
