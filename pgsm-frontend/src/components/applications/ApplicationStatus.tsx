import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, FileSearch } from "lucide-react";

type Status = "submitted" | "under_review" | "accepted" | "rejected";

interface ApplicationStatusProps {
  status: Status;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

const statusConfig: Record<Status, { icon: typeof CheckCircle2; label: string; className: string }> = {
  submitted: {
    icon: Clock,
    label: "Submitted",
    className: "badge-status bg-info/10 text-info",
  },
  under_review: {
    icon: FileSearch,
    label: "Under Review",
    className: "badge-status badge-pending",
  },
  accepted: {
    icon: CheckCircle2,
    label: "Accepted",
    className: "badge-status badge-accepted",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    className: "badge-status badge-rejected",
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  default: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export function ApplicationStatus({
  status,
  showLabel = true,
  size = "default",
  className,
}: ApplicationStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(config.className, sizeClasses[size], className)}>
      <Icon className={cn("w-3.5 h-3.5", showLabel && "mr-1.5")} />
      {showLabel && config.label}
    </span>
  );
}
