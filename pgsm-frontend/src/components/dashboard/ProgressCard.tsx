import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  title: string;
  progress: number;
  description?: string;
  items?: { label: string; completed: boolean }[];
  className?: string;
}

export function ProgressCard({
  title,
  progress,
  description,
  items,
  className,
}: ProgressCardProps) {
  return (
    <div className={cn("stat-card", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        {items && items.length > 0 && (
          <ul className="space-y-2 mt-4">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                    item.completed
                      ? "bg-success/20 text-success"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.completed ? "✓" : index + 1}
                </span>
                <span
                  className={cn(
                    item.completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  )}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
