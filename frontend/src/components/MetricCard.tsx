import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  variant?: "default" | "warning" | "danger" | "success";
}

const variantStyles = {
  default: "border-border",
  warning: "border-warning/30",
  danger: "border-destructive/30",
  success: "border-success/30",
};

const iconVariantStyles = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
};

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, variant = "default" }) => {
  return (
    <div className={cn("rounded-lg border bg-card p-4 transition-colors", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-card-foreground">{value}</p>
          {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconVariantStyles[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
};
