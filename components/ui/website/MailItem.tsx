import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideSettings2 } from "lucide-react";

type NotificationLevel = "SUCCESS" | "INFO" | "WARNING" | "DANGER";

export interface Mail {
  id: string;
  name: string;
  date: string;
  subject: string;
  teaser: string;
  level: NotificationLevel;
  isSystem?: boolean;
  read?: boolean;
}

export function MailItem({
  mail,
  onClick,
}: {
  mail: Mail;
  onClick?: () => void;
}) {
  const levelStyleMap: Record<
    NotificationLevel,
    {
      badge: string;
      dot: string;
      indicator: string;
    }
  > = {
    SUCCESS: {
      badge: "bg-green-100 text-green-700",
      dot: "bg-green-500",
      indicator: "border-l-4 border-green-500",
    },
    INFO: {
      badge: "bg-blue-100 text-blue-700",
      dot: "bg-blue-500",
      indicator: "border-l-4 border-blue-500",
    },
    WARNING: {
      badge: "bg-yellow-100 text-yellow-800",
      dot: "bg-yellow-500",
      indicator: "border-l-4 border-yellow-500",
    },
    DANGER: {
      badge: "bg-red-100 text-red-700",
      dot: "bg-red-500",
      indicator: "border-l-4 border-red-500",
    },
  };

  const styles = levelStyleMap[mail.level];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.();
      }}
      className={cn(
        "group block border-b p-4 transition-colors bg-background hover:bg-muted mb-2",
        styles.indicator,
        !mail.read && "bg-muted/50"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {!mail.read && (
            <span className={cn("h-2 w-2 rounded-full", styles.dot)} />
          )}
          <span
            className={cn(
              "font-semibold text-foreground",
              !mail.read && "font-bold"
            )}
          >
            {mail.name}
          </span>
          {mail.isSystem && (
            <LucideSettings2 size={14} className="text-muted-foreground" />
          )}
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-foreground">
          {mail.date}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn(
            "text-sm text-foreground line-clamp-1",
            !mail.read && "font-semibold"
          )}
        >
          {mail.subject}
        </span>
        <Badge
          className={cn("text-[10px]  font-medium rounded-full", styles.badge)}
        >
          {mail.level}
        </Badge>
      </div>

      <div className="text-xs text-muted-foreground line-clamp-2">
        {mail.teaser}
      </div>
    </div>
  );
}
