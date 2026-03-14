import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  done: "bg-success/10 text-success",
  ready: "bg-success/10 text-success",
  ship: "bg-success/10 text-success",
  waiting: "bg-warning/10 text-warning",
  pending: "bg-warning/10 text-warning",
  pack: "bg-warning/10 text-warning",
  in_progress: "bg-primary/10 text-primary",
  pick: "bg-primary/10 text-primary",
  draft: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const style = statusStyles[status] || "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize", style, className)}>
      {status.replace("_", " ")}
    </span>
  );
};
