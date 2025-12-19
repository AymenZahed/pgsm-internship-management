import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "application" | "evaluation" | "message" | "internship" | "document";
  title: string;
  description: string;
  time: string;
  status?: "success" | "warning" | "info" | "default";
}

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
}

const typeIcons: Record<Activity["type"], string> = {
  application: "📝",
  evaluation: "⭐",
  message: "💬",
  internship: "🏥",
  document: "📄",
};

const statusStyles: Record<NonNullable<Activity["status"]>, string> = {
  success: "bg-success/10 border-success/30",
  warning: "bg-warning/10 border-warning/30",
  info: "bg-info/10 border-info/30",
  default: "bg-muted/50 border-border",
};

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm animate-fade-in",
            statusStyles[activity.status || "default"]
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span className="text-xl">{typeIcons[activity.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground">{activity.title}</p>
            <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
        </div>
      ))}
    </div>
  );
}
