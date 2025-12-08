import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Clock, Building2 } from "lucide-react";

interface InternshipCardProps {
  id: string;
  title: string;
  hospital: string;
  service: string;
  location: string;
  startDate: string;
  endDate: string;
  spotsAvailable: number;
  totalSpots: number;
  deadline: string;
  tags: string[];
  onApply?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  className?: string;
}

export function InternshipCard({
  id,
  title,
  hospital,
  service,
  location,
  startDate,
  endDate,
  spotsAvailable,
  totalSpots,
  deadline,
  tags,
  onApply,
  onViewDetails,
  className,
}: InternshipCardProps) {
  const isUrgent = spotsAvailable <= 2;
  const isFull = spotsAvailable === 0;

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 group",
        className
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>{hospital}</span>
              <span className="text-border">•</span>
              <span>{service}</span>
            </div>
          </div>
          {isUrgent && !isFull && (
            <Badge variant="destructive" className="animate-pulse-soft">
              Urgent
            </Badge>
          )}
          {isFull && (
            <Badge variant="secondary">Full</Badge>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{startDate} - {endDate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>{spotsAvailable}/{totalSpots} spots</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>Deadline: {deadline}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="default"
            className="flex-1"
            disabled={isFull}
            onClick={() => onApply?.(id)}
          >
            {isFull ? "No Spots Available" : "Apply Now"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onViewDetails?.(id)}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
